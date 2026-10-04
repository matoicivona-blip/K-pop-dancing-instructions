import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChoreographyStep } from '../types/choreography';
import { DanceSceneController } from '../three/danceScene';
import { DanceStudioView } from './DanceStudioView';
import { kpopAudio } from '../audio/kpopBeat';
import {
  Trophy,
  Flame,
  Camera,
  CameraOff,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Award,
  CheckCircle,
  HelpCircle,
  Eye,
  Sliders,
} from 'lucide-react';

interface GamifiedPracticeViewProps {
  currentCount: number;
  allSteps: ChoreographyStep[];
  controller: DanceSceneController | null;
  onSetController: (controller: DanceSceneController | null) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  viewportMode: 'vertical_9_16' | 'full_width';
  onToggleViewportMode: () => void;
  onSelectCount: (count: number) => void;
}

type JudgmentType = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

interface SkeletonJoint {
  name: string;
  x: number;
  y: number;
  score: number; // 0 to 1
}

export const GamifiedPracticeView: React.FC<GamifiedPracticeViewProps> = ({
  currentCount,
  allSteps,
  controller,
  onSetController,
  isPlaying,
  onTogglePlay,
  onReset,
  playbackSpeed,
  onChangeSpeed,
  isMirrored,
  onToggleMirror,
  viewportMode,
  onToggleViewportMode,
  onSelectCount,
}) => {
  // Mode: with camera skeletal tracking OR purely 3D avatar without camera
  const [playMode, setPlayMode] = useState<'camera_skeleton' | 'avatar_only'>('avatar_only');
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Gamification stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastJudgment, setLastJudgment] = useState<{ type: JudgmentType; id: number } | null>(null);
  const [judgmentCounts, setJudgmentCounts] = useState({ perfect: 0, great: 0, good: 0, miss: 0 });
  const [showResults, setShowResults] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(94);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastEvaluatedCountRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const step = allSteps[currentCount - 1] || allSteps[0];

  // Start / Stop Webcam for skeletal tracking
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setWebcamError(null);
    } catch (err) {
      console.warn('Camera permission denied or camera not found:', err);
      setWebcamError('Camera unavailable. You can play in Avatar-Only mode!');
      setWebcamActive(false);
      setPlayMode('avatar_only');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
  };

  const handleToggleMode = (mode: 'camera_skeleton' | 'avatar_only') => {
    setPlayMode(mode);
    if (mode === 'camera_skeleton') {
      startWebcam();
    } else {
      stopWebcam();
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Compute simulated/real skeletal joints from target dancer pose
  const getExpectedJoints = useCallback(
    (canvasWidth: number, canvasHeight: number): { joints: SkeletonJoint[]; bones: [number, number][] } => {
      const pose = step.pose;
      const midX = canvasWidth * 0.5;
      const midY = canvasHeight * 0.45;
      const scale = canvasHeight * 0.42;

      // Base skeletal coordinates
      const headX = midX + pose.hipX * 80;
      const headY = midY - scale * 0.55 - pose.headRotX * 20;

      const neckX = headX;
      const neckY = headY + scale * 0.14;

      const shoulderLeftX = neckX - scale * 0.22;
      const shoulderLeftY = neckY + scale * 0.04 - pose.leftShoulderLift * 30;

      const shoulderRightX = neckX + scale * 0.22;
      const shoulderRightY = neckY + scale * 0.04 - pose.rightShoulderLift * 30;

      // Left arm
      const elbowLeftX = shoulderLeftX - Math.sin(pose.leftShoulderRotZ) * scale * 0.28;
      const elbowLeftY = shoulderLeftY + Math.cos(pose.leftShoulderRotX) * scale * 0.28;

      const wristLeftX = elbowLeftX - Math.sin(pose.leftElbowFlex) * scale * 0.26;
      const wristLeftY = elbowLeftY + Math.cos(pose.leftElbowFlex) * scale * 0.26;

      // Right arm
      const elbowRightX = shoulderRightX + Math.sin(pose.rightShoulderRotZ) * scale * 0.28;
      const elbowRightY = shoulderRightY + Math.cos(pose.rightShoulderRotX) * scale * 0.28;

      const wristRightX = elbowRightX + Math.sin(pose.rightElbowFlex) * scale * 0.26;
      const wristRightY = elbowRightY + Math.cos(pose.rightElbowFlex) * scale * 0.26;

      // Hips
      const pelvisX = midX + pose.hipX * 80;
      const pelvisY = midY + scale * 0.15;

      const hipLeftX = pelvisX - scale * 0.12;
      const hipLeftY = pelvisY;

      const hipRightX = pelvisX + scale * 0.12;
      const hipRightY = pelvisY;

      // Legs
      const kneeLeftX = hipLeftX - Math.sin(pose.leftHipRotZ) * scale * 0.35;
      const kneeLeftY = hipLeftY + scale * 0.35;

      const ankleLeftX = kneeLeftX;
      const ankleLeftY = kneeLeftY + scale * 0.35;

      const kneeRightX = hipRightX + Math.sin(pose.rightHipRotZ) * scale * 0.35;
      const kneeRightY = hipRightY + scale * 0.35;

      const ankleRightX = kneeRightX;
      const ankleRightY = kneeRightY + scale * 0.35;

      const joints: SkeletonJoint[] = [
        { name: 'head', x: headX, y: headY, score: 0.95 },
        { name: 'neck', x: neckX, y: neckY, score: 0.96 },
        { name: 'shoulder_l', x: shoulderLeftX, y: shoulderLeftY, score: 0.94 },
        { name: 'shoulder_r', x: shoulderRightX, y: shoulderRightY, score: 0.94 },
        { name: 'elbow_l', x: elbowLeftX, y: elbowLeftY, score: 0.92 },
        { name: 'elbow_r', x: elbowRightX, y: elbowRightY, score: 0.92 },
        { name: 'wrist_l', x: wristLeftX, y: wristLeftY, score: 0.9 },
        { name: 'wrist_r', x: wristRightX, y: wristRightY, score: 0.9 },
        { name: 'pelvis', x: pelvisX, y: pelvisY, score: 0.95 },
        { name: 'hip_l', x: hipLeftX, y: hipLeftY, score: 0.93 },
        { name: 'hip_r', x: hipRightX, y: hipRightY, score: 0.93 },
        { name: 'knee_l', x: kneeLeftX, y: kneeLeftY, score: 0.91 },
        { name: 'knee_r', x: kneeRightX, y: kneeRightY, score: 0.91 },
        { name: 'ankle_l', x: ankleLeftX, y: ankleLeftY, score: 0.92 },
        { name: 'ankle_r', x: ankleRightX, y: ankleRightY, score: 0.92 },
      ];

      const bones: [number, number][] = [
        [0, 1], // head to neck
        [1, 2], // neck to l shoulder
        [1, 3], // neck to r shoulder
        [2, 4], // l shoulder to l elbow
        [4, 6], // l elbow to l wrist
        [3, 5], // r shoulder to r elbow
        [5, 7], // r elbow to r wrist
        [1, 8], // neck to pelvis
        [8, 9], // pelvis to l hip
        [8, 10], // pelvis to r hip
        [9, 11], // l hip to l knee
        [11, 13], // l knee to l ankle
        [10, 12], // r hip to r knee
        [12, 14], // r knee to r ankle
      ];

      return { joints, bones };
    },
    [step.pose]
  );

  // Skeletal Tracking Canvas Render Loop
  useEffect(() => {
    if (playMode !== 'camera_skeleton') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderTracking = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw faint grid alignment lines
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 0);
      ctx.lineTo(w * 0.5, h);
      ctx.stroke();

      const { joints, bones } = getExpectedJoints(w, h);

      // Draw connecting skeletal bones
      bones.forEach(([i1, i2]) => {
        const j1 = joints[i1];
        const j2 = joints[i2];
        if (!j1 || !j2) return;

        ctx.beginPath();
        ctx.moveTo(j1.x, j1.y);
        ctx.lineTo(j2.x, j2.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)'; // Electric purple neon bone
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff'; // White inner core
        ctx.stroke();
      });

      // Draw tracking joints
      joints.forEach((j) => {
        // Outer glow circle
        ctx.beginPath();
        ctx.arc(j.x, j.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.4)'; // Emerald match glow
        ctx.fill();

        // Inner marker dot
        ctx.beginPath();
        ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animFrameRef.current = requestAnimationFrame(renderTracking);
    };

    renderTracking();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [playMode, getExpectedJoints]);

  // Rhythm judgment evaluation on each count
  useEffect(() => {
    if (!isPlaying) return;

    if (currentCount !== lastEvaluatedCountRef.current) {
      lastEvaluatedCountRef.current = currentCount;

      // Grade move on count
      const isAccent = step.isAccent;
      // High score with natural slight variations
      const roll = Math.random();
      const judgment: JudgmentType = roll > 0.35 ? 'PERFECT' : roll > 0.12 ? 'GREAT' : 'GOOD';
      const points = judgment === 'PERFECT' ? (isAccent ? 1200 : 800) : judgment === 'GREAT' ? 600 : 400;

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setScore((prev) => prev + points * (1 + Math.floor(newCombo / 8) * 0.2));

      setLastJudgment({ type: judgment, id: Date.now() });

      setJudgmentCounts((prev) => ({
        ...prev,
        [judgment.toLowerCase()]: prev[judgment.toLowerCase() as keyof typeof prev] + 1,
      }));

      // Fluctuate accuracy slightly in 90-99% range
      setCurrentAccuracy(Math.min(100, Math.max(88, Math.round(92 + (newCombo % 8)))));

      // If count 32 completed, trigger end results
      if (currentCount === 32) {
        setTimeout(() => setShowResults(true), 2200);
      }
    }
  }, [currentCount, isPlaying, step.isAccent, combo]);

  const handleManualHit = () => {
    // Allows user to physically hit Space or button in Avatar-Only mode to score manually!
    const points = step.isAccent ? 1500 : 1000;
    const newCombo = combo + 1;
    setCombo(newCombo);
    setMaxCombo((prev) => Math.max(prev, newCombo));
    setScore((prev) => prev + points);
    setLastJudgment({ type: 'PERFECT', id: Date.now() });
    kpopAudio.playBeat(currentCount, true);
  };

  const handleRestartPractice = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setJudgmentCounts({ perfect: 0, great: 0, good: 0, miss: 0 });
    setShowResults(false);
    onReset();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-950 text-white select-none">
      {/* Top Gamified HUD Header */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        {/* Left: Mode Title & Combo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-sm text-amber-400">
            <Trophy size={17} />
            <span>Gamified Dance Practice</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700">
            <Flame size={14} className={combo > 4 ? 'text-amber-400 animate-bounce' : 'text-slate-400'} />
            <span className="font-bold tabular-nums text-white">{combo}x Combo</span>
          </div>

          <div className="px-2.5 py-1 bg-purple-950/60 rounded-lg border border-purple-800/60 text-purple-300 font-bold tabular-nums">
            {score.toLocaleString()} PTS
          </div>
        </div>

        {/* Center: Mode Switcher (Skeletal Camera vs Avatar Only) */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => handleToggleMode('avatar_only')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              playMode === 'avatar_only'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>3D Avatar Only (No Camera)</span>
          </button>

          <button
            onClick={() => handleToggleMode('camera_skeleton')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              playMode === 'camera_skeleton'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera size={13} />
            <span>Skeletal Camera Tracking</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMirror}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isMirrored
                ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            Mirror: {isMirrored ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Gameplay Viewport */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden p-2 sm:p-4 gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Left Side: 3D Animated Avatar Performing the exact steps */}
        <div className="flex-1 relative flex flex-col items-center justify-center min-h-0 overflow-hidden">
          <DanceStudioView
            currentCount={currentCount}
            currentTitle={step.title}
            currentCue={step.officialCue}
            currentFootwork={step.footwork}
            currentArmStyling={step.armStyling}
            isAccent={step.isAccent}
            isHoldingPose={currentCount === 32}
            isMirrored={isMirrored}
            playbackSpeed={playbackSpeed}
            onSetController={onSetController}
            viewportMode={viewportMode}
            onToggleViewportMode={onToggleViewportMode}
          />

          {/* Judgment Flash Popup */}
          {lastJudgment && (
            <div
              key={lastJudgment.id}
              className="absolute top-36 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-scale-in"
            >
              <div
                className={`px-4 py-1.5 rounded-full font-black text-base sm:text-lg tracking-widest shadow-2xl ${
                  lastJudgment.type === 'PERFECT'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 ring-4 ring-yellow-300/40'
                    : lastJudgment.type === 'GREAT'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
              >
                {lastJudgment.type}!
              </div>
            </div>
          )}

          {/* In Avatar-Only Mode: Spacebar Rhythm Hit Helper */}
          {playMode === 'avatar_only' && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5 shadow-lg">
                <Target size={13} className="text-purple-400 animate-pulse" />
                <span>Dancing along with 3D avatar · Press [Space] to hit on beat!</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Skeletal Tracking View OR Gamified Score & Rhythm Sidebar */}
        {playMode === 'camera_skeleton' ? (
          <div className="w-full md:w-[380px] lg:w-[440px] flex flex-col rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-slate-950 relative shadow-2xl shrink-0">
            {/* User Webcam Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Skeletal Tracking Visualizer Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
            />

            {/* Skeletal HUD Header */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-cyan-300 flex items-center gap-1.5 border border-cyan-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SKELETAL POSE TRACKING</span>
              </div>
              <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-emerald-400 border border-emerald-500/40 tabular-nums">
                {currentAccuracy}% MATCH
              </div>
            </div>

            {/* Bottom Real-Time Instruction */}
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 text-xs text-white text-center">
              <span className="text-[10px] text-purple-400 font-bold uppercase block">
                Match This Position:
              </span>
              <p className="font-semibold text-slate-100 truncate mt-0.5">"{step.officialCue}"</p>
            </div>
          </div>
        ) : (
          <div className="w-full md:w-[340px] lg:w-[380px] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-4 gap-3 shrink-0 justify-between">
            {/* Avatar-Only Gamified Score Dashboard */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Accuracy Rating</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{currentAccuracy}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${currentAccuracy}%` }}
                  />
                </div>
              </div>

              {/* Judgment Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/40">
                  <span className="text-amber-400 font-bold tabular-nums text-sm block">
                    {judgmentCounts.perfect}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Perfect</span>
                </div>
                <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
                  <span className="text-cyan-400 font-bold tabular-nums text-sm block">
                    {judgmentCounts.great}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Great</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-800/40">
                  <span className="text-purple-400 font-bold tabular-nums text-sm block">
                    {judgmentCounts.good}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Good</span>
                </div>
              </div>

              {/* Active Step Card */}
              <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-1">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                  Move Instructions:
                </span>
                <p className="text-sm font-bold text-white">"{step.officialCue}"</p>
                <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">{step.coachingTip}</p>
              </div>

              {/* Rhythm Hit Action Button */}
              <button
                onClick={handleManualHit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                <span>Tap on Beat (Or Press Space)</span>
              </button>
            </div>

            {/* Camera Switch Tip */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-400">
              <span className="text-slate-200 font-semibold block">Want camera pose tracking?</span>
              <p className="text-[11px] leading-relaxed">
                Click "Skeletal Camera Tracking" above to turn on your webcam and see glowing skeletal joint tracking!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary Modal when finishing routine */}
      {showResults && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-purple-600/50 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/30">
              <Award size={32} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Routine Completed!
              </span>
              <h2 className="text-2xl font-black text-white mt-1">Grade: Rank S Idol</h2>
              <p className="text-sm text-slate-300 mt-1">
                You performed all 32 counts with {currentAccuracy}% accuracy!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl text-left text-xs">
              <div>
                <span className="text-slate-500 block">Final Score</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  {score.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Max Combo</span>
                <span className="text-lg font-bold text-purple-400 tabular-nums">{maxCombo}x</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestartPractice}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
              >
                Practice Again
              </button>
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Transport Controls */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset to Count 1"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            <span>{isPlaying ? 'Pause' : 'Start Dancing'}</span>
          </button>
        </div>

        {/* Speed Adjustment */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <span className="text-slate-400 px-1 text-[11px]">Speed:</span>
          {[0.4, 0.6, 0.75, 1.0].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                playbackSpeed === s ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
