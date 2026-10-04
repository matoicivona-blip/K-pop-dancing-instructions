import React, { useState, useEffect, useRef } from 'react';
import { WARMUP_EXERCISES, WarmUpExercise } from '../data/warmUpExercises';
import { DanceSceneController } from '../three/danceScene';
import { DanceStudioView } from './DanceStudioView';
import { interpolatePoses } from '../three/dancePoses';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Heart,
  ShieldCheck,
} from 'lucide-react';

interface WarmUpViewProps {
  controller: DanceSceneController | null;
  onSetController: (controller: DanceSceneController | null) => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  viewportMode: 'vertical_9_16' | 'full_width';
  onToggleViewportMode: () => void;
  onFinishWarmUp: () => void;
}

export const WarmUpView: React.FC<WarmUpViewProps> = ({
  controller,
  onSetController,
  isMirrored,
  onToggleMirror,
  viewportMode,
  onToggleViewportMode,
  onFinishWarmUp,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(WARMUP_EXERCISES[0].durationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentExercise = WARMUP_EXERCISES[currentExerciseIndex];
  const progressPercent = Math.round(((currentExerciseIndex + 1) / WARMUP_EXERCISES.length) * 100);

  // Switch exercise
  const handleSelectExercise = (idx: number) => {
    setCurrentExerciseIndex(idx);
    setTimerSeconds(WARMUP_EXERCISES[idx].durationSeconds);
    setIsTimerRunning(true);
  };

  const handlePrev = () => {
    const prev = currentExerciseIndex > 0 ? currentExerciseIndex - 1 : WARMUP_EXERCISES.length - 1;
    handleSelectExercise(prev);
  };

  const handleNext = () => {
    if (currentExerciseIndex < WARMUP_EXERCISES.length - 1) {
      handleSelectExercise(currentExerciseIndex + 1);
    } else {
      // Completed all warm-up slides!
      onFinishWarmUp();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsTimerRunning((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Timer finished for this exercise
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Smooth warm-up animation loop on the 3D avatar
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      if (controller) {
        // Continuous smooth sinusoidal oscillation between poseA and poseB
        const freq = 1.6; // comfortable breathing warm-up rhythm
        const t = (Math.sin(elapsed * freq) + 1) / 2; // 0 to 1
        const pose = interpolatePoses(currentExercise.poseA, currentExercise.poseB, t);

        controller.dancer.applyPose(pose, isMirrored, 0);
        if (controller.partnerDancer) {
          controller.partnerDancer.applyPose(pose, isMirrored, 0);
        }
        controller.updateAnimation(0.016);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [controller, currentExercise, isMirrored]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-slate-950 text-white select-none">
      {/* 3D Animated Avatar Viewport demonstrating the current warm-up */}
      <div className="flex-1 flex flex-col relative min-h-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2 sm:p-4 overflow-hidden">
        <DanceStudioView
          currentCount={currentExercise.id}
          currentTitle={currentExercise.title}
          currentCue={currentExercise.instructions[0]}
          currentFootwork={currentExercise.recommendedReps}
          currentArmStyling={currentExercise.focusArea}
          isAccent={false}
          isHoldingPose={false}
          isMirrored={isMirrored}
          playbackSpeed={0.5}
          onSetController={onSetController}
          viewportMode={viewportMode}
          onToggleViewportMode={onToggleViewportMode}
        />
      </div>

      {/* Warm-Up Slide Instructions Panel */}
      <div className="w-full lg:w-[480px] xl:w-[520px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/95 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto shrink-0 custom-scrollbar">
        {/* Progress & Header */}
        <div className="space-y-2 border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" />
              <span>Warm-Up Slide {currentExercise.id} of {WARMUP_EXERCISES.length}</span>
            </span>
            <span className="text-slate-400 font-medium tabular-nums">{progressPercent}% Completed</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
              Focus: {currentExercise.focusArea}
            </span>
            <span className="text-xs text-slate-400 font-medium">{currentExercise.recommendedReps}</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{currentExercise.title}</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentExercise.subtitle}</p>
        </div>

        {/* Practice Timer Card */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 font-mono font-bold text-lg tabular-nums">
              {timerSeconds}s
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                {timerSeconds > 0 ? 'Follow Along With Avatar' : 'Exercise Complete! Ready for Next Slide'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isTimerRunning ? 'Timer active' : 'Timer paused'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
            >
              {isTimerRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            </button>
            <button
              onClick={() => {
                setTimerSeconds(currentExercise.durationSeconds);
                setIsTimerRunning(true);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
            Instructions:
          </span>
          <ul className="space-y-2.5 text-xs text-slate-200 pt-1">
            {currentExercise.instructions.map((instr, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-purple-900/80 border border-purple-700 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{instr}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Coach Insight */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Sparkles size={14} />
            <span>Idol Instructor Tip</span>
          </div>
          <p className="text-amber-200/90 leading-relaxed pt-0.5">{currentExercise.coachingTip}</p>
        </div>

        {/* Slide Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handlePrev}
            disabled={currentExerciseIndex === 0}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentExerciseIndex === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {currentExerciseIndex < WARMUP_EXERCISES.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-colors cursor-pointer"
            >
              <span>Next Warm-Up Slide</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onFinishWarmUp}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
            >
              <span>Warm-Up Done! Start Dancing</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Quick Exercise Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 border-t border-slate-800">
          {WARMUP_EXERCISES.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                idx === currentExerciseIndex
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx + 1}. {ex.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
