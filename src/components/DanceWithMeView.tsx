import React, { useState, useEffect, useRef } from 'react';
import { ChoreographyStep } from '../types/choreography';
import { DanceSceneController } from '../three/danceScene';
import { DanceStudioView } from './DanceStudioView';
import {
  Camera,
  CameraOff,
  Users,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Flame,
  ArrowRight,
  Video,
} from 'lucide-react';
import { kpopAudio } from '../audio/kpopBeat';

interface DanceWithMeViewProps {
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
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  isVoiceCountEnabled: boolean;
  onToggleVoiceCount: () => void;
  viewportMode: 'vertical_9_16' | 'full_width';
  onToggleViewportMode: () => void;
}

export const DanceWithMeView: React.FC<DanceWithMeViewProps> = ({
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
  isAudioMuted,
  onToggleAudio,
  isVoiceCountEnabled,
  onToggleVoiceCount,
  viewportMode,
  onToggleViewportMode,
}) => {
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [partnerDuoEnabled, setPartnerDuoEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const step = allSteps[currentCount - 1] || allSteps[0];

  // Toggle Webcam
  const handleToggleWebcam = async () => {
    if (webcamEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setWebcamEnabled(false);
      setWebcamError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamEnabled(true);
        setWebcamError(null);
      } catch (err) {
        console.warn('Webcam permission not granted or unavailable:', err);
        setWebcamError('Camera access unavailable. You can still dance along with the 3D avatars!');
        setWebcamEnabled(false);
      }
    }
  };

  useEffect(() => {
    if (webcamEnabled && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [webcamEnabled]);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Toggle Partner Duo Formation in 3D scene
  const handleTogglePartner = () => {
    const next = !partnerDuoEnabled;
    setPartnerDuoEnabled(next);
    if (controller) {
      controller.setPartnerDuoMode(next);
    }
  };

  useEffect(() => {
    if (controller) {
      controller.setPartnerDuoMode(partnerDuoEnabled);
    }
  }, [controller, partnerDuoEnabled]);

  // "Get Ready to Dance" countdown handler
  const handleStartCountdown = () => {
    onReset();
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (!isPlaying) onTogglePlay();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-950">
      {/* Top Banner: Dance Along Companion Header */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-1.5">
            <Flame size={16} className="text-amber-400" />
            <span>Dance Along With Me Mode</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">· Stand up and follow the moves in real time!</span>
        </div>

        {/* Companion Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartCountdown}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            <span>3s Countdown & Start</span>
          </button>

          <button
            onClick={handleTogglePartner}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              partnerDuoEnabled
                ? 'bg-purple-900/80 border-purple-500 text-purple-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>3D Duo Avatar {partnerDuoEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleToggleWebcam}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              webcamEnabled
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {webcamEnabled ? <CameraOff size={14} /> : <Camera size={14} />}
            <span>Webcam Mirror {webcamEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Stage View */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden p-2 sm:p-4 gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Left Side: 3D Animated Avatar (Instructor / Duo) */}
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

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-40 pointer-events-none">
              <span className="text-7xl font-black text-purple-400 animate-bounce">{countdown}</span>
              <p className="text-base font-bold text-white mt-2 uppercase tracking-widest">
                Get into ready position!
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Rehearsal Camera Mirror or Move Coaching Companion */}
        {webcamEnabled ? (
          <div className="w-full md:w-[380px] lg:w-[440px] flex flex-col rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-slate-900 relative shadow-2xl shrink-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" // Mirrored for natural dance reflection!
            />
            {/* Mirror Header Tag */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-cyan-300 flex items-center gap-1.5 border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>YOUR LIVE REHEARSAL MIRROR</span>
            </div>

            {/* Current Move Hint on Webcam */}
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 text-xs text-white text-center">
              <span className="text-[10px] text-purple-400 font-bold uppercase block">
                Do this with the avatar:
              </span>
              <p className="font-semibold text-slate-100 truncate mt-0.5">"{step.officialCue}"</p>
            </div>
          </div>
        ) : (
          <div className="w-full md:w-[360px] lg:w-[400px] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-4 gap-3 shrink-0 justify-between">
            {/* Live Dance Partner Prompt */}
            <div className="space-y-3">
              <div className="p-3 bg-purple-950/50 border border-purple-800/60 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                  Action Cue for You:
                </span>
                <p className="text-base font-bold text-white leading-snug">
                  "{step.officialCue}"
                </p>
              </div>

              {/* Movement Directions */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60">
                  <span className="font-semibold text-emerald-400 block">Footwork:</span>
                  <p className="text-slate-300 mt-0.5">{step.footwork}</p>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60">
                  <span className="font-semibold text-cyan-400 block">Arms:</span>
                  <p className="text-slate-300 mt-0.5">{step.armStyling}</p>
                </div>

                <div className="p-2.5 bg-amber-950/30 rounded-lg border border-amber-800/40">
                  <span className="font-semibold text-amber-300 block">Coach Tip:</span>
                  <p className="text-amber-200/90 mt-0.5">{step.coachingTip}</p>
                </div>
              </div>

              {webcamError && (
                <p className="text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded-lg border border-amber-800/40">
                  {webcamError}
                </p>
              )}
            </div>

            {/* Webcam CTA Card */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Video size={16} className="text-cyan-400" />
                <span>Want to see yourself dancing?</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click "Webcam Mirror" to open your device camera side-by-side with the dancer like a real dance studio mirror.
              </p>
              <button
                onClick={handleToggleWebcam}
                className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Enable Dance Mirror Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Transport Bar for Follow Along Mode */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset"
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

          <button
            onClick={onToggleMirror}
            className={`px-3 py-2 rounded-lg border font-medium transition-colors cursor-pointer ${
              isMirrored
                ? 'bg-purple-950 border-purple-500 text-purple-200'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <FlipHorizontal size={14} className="inline mr-1" />
            <span>Mirror: {isMirrored ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Speed Selector */}
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

        {/* Audio Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAudio}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
