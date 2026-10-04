import React, { useState, useEffect, useRef } from 'react';
import { ChoreographyStep } from '../types/choreography';
import { DanceSceneController } from '../three/danceScene';
import { DanceStudioView } from './DanceStudioView';
import {
  ChevronLeft,
  ChevronRight,
  Repeat,
  Play,
  Pause,
  Clock,
  Footprints,
  HandMetal,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { kpopAudio } from '../audio/kpopBeat';

interface SlideLearningViewProps {
  currentCount: number;
  allSteps: ChoreographyStep[];
  onSelectCount: (count: number) => void;
  controller: DanceSceneController | null;
  onSetController: (controller: DanceSceneController | null) => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  viewportMode: 'vertical_9_16' | 'full_width';
  onToggleViewportMode: () => void;
  onOpenWarmUp?: () => void;
}

export const SlideLearningView: React.FC<SlideLearningViewProps> = ({
  currentCount,
  allSteps,
  onSelectCount,
  controller,
  onSetController,
  isMirrored,
  onToggleMirror,
  viewportMode,
  onToggleViewportMode,
  onOpenWarmUp,
}) => {
  const [isAutoSlide, setIsAutoSlide] = useState(false);
  const [slideSpeedSeconds, setSlideSpeedSeconds] = useState(3.0); // Default comfortable study pace: 3s per slide
  const [isLoopingCurrentStep, setIsLoopingCurrentStep] = useState(true);

  const step = allSteps[currentCount - 1] || allSteps[0];
  const progressPercent = Math.round((currentCount / 32) * 100);

  // Jump slide handler
  const handlePrevSlide = () => {
    const prev = currentCount > 1 ? currentCount - 1 : 32;
    onSelectCount(prev);
  };

  const handleNextSlide = () => {
    const next = currentCount < 32 ? currentCount + 1 : 1;
    onSelectCount(next);
  };

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoSlide((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Auto-slide timer
  useEffect(() => {
    if (!isAutoSlide) return;

    const timer = setInterval(() => {
      onSelectCount(currentCount < 32 ? currentCount + 1 : 1);
    }, slideSpeedSeconds * 1000);

    return () => clearInterval(timer);
  }, [isAutoSlide, slideSpeedSeconds, currentCount, onSelectCount]);

  // When step changes, apply to dancer
  useEffect(() => {
    if (!controller) return;

    // In slide mode, set the pose for this exact count
    // Timing calculation: count index
    let startTime = 0;
    for (let i = 0; i < currentCount - 1; i++) {
      startTime += 0.6;
    }
    controller.setPlaybackTime(startTime);
  }, [controller, currentCount]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-slate-950">
      {/* 3D Animated Avatar Viewport with Floating Step Text (Above Avatar) */}
      <div className="flex-1 flex flex-col relative min-h-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2 sm:p-4 overflow-hidden">
        <DanceStudioView
          currentCount={currentCount}
          currentTitle={step.title}
          currentCue={step.officialCue}
          currentFootwork={step.footwork}
          currentArmStyling={step.armStyling}
          isAccent={step.isAccent}
          isHoldingPose={currentCount === 32}
          isMirrored={isMirrored}
          playbackSpeed={0.6}
          onSetController={onSetController}
          viewportMode={viewportMode}
          onToggleViewportMode={onToggleViewportMode}
        />
      </div>

      {/* Slide Learning Panel */}
      <div className="w-full lg:w-[480px] xl:w-[520px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/95 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto shrink-0 custom-scrollbar">
        {/* Slide Progress Header */}
        <div className="space-y-2 border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-400 uppercase tracking-wider">
              Slide {currentCount} of 32
            </span>
            <span className="text-slate-400 font-medium tabular-nums">{progressPercent}% Mastered</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              Part {step.setNumber} · Beat {((currentCount - 1) % 8) + 1} of 8
            </span>
            <select
              value={currentCount}
              onChange={(e) => onSelectCount(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-purple-500 cursor-pointer"
            >
              {allSteps.map((s) => (
                <option key={s.count} value={s.count}>
                  Slide {s.count}: {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warm-Up Recommendation Pill */}
        {onOpenWarmUp && (
          <div className="p-2.5 bg-gradient-to-r from-amber-950/40 to-purple-950/40 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">🔥 Warm Up First?</span>
              <span className="text-[11px] text-slate-300 hidden sm:inline">Loosen neck, hips & shoulders</span>
            </div>
            <button
              onClick={onOpenWarmUp}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Open Warm-Up Slides →
            </button>
          </div>
        )}

        {/* Primary Slide Transport Controls */}
        <div className="flex items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <button
            onClick={handlePrevSlide}
            title="Previous Slide (Left Arrow)"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Prev Slide</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoSlide(!isAutoSlide)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAutoSlide
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isAutoSlide ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{isAutoSlide ? 'Pause Slides' : 'Auto Play'}</span>
            </button>
          </div>

          <button
            onClick={handleNextSlide}
            title="Next Slide (Right Arrow)"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <span>Next Slide</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Speed Adjustment for Slides */}
        <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock size={14} className="text-purple-400" />
            <span>Learning Pace:</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { sec: 1.5, label: 'Fast (1.5s)' },
              { sec: 3.0, label: 'Standard (3.0s)' },
              { sec: 5.0, label: 'Slow (5.0s)' },
            ].map((opt) => (
              <button
                key={opt.sec}
                onClick={() => setSlideSpeedSeconds(opt.sec)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  slideSpeedSeconds === opt.sec
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step Breakdown Card */}
        <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              Step Instruction
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{step.title}</h2>
          </div>

          {/* Official Prompt Cue */}
          <div className="p-3 bg-purple-950/50 border border-purple-800/50 rounded-lg">
            <p className="text-sm font-semibold text-purple-100">
              "{step.officialCue}"
            </p>
          </div>

          {/* Footwork & Arm Placement */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-start gap-2.5">
              <Footprints size={17} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">Footwork</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{step.footwork}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-start gap-2.5">
              <HandMetal size={17} className="text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">Arm & Hand Alignment</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{step.armStyling}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg flex items-start gap-2.5">
              <Info size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300 block">Pro Coach Insight</span>
                <p className="text-amber-200/90 mt-0.5 leading-relaxed">{step.coachingTip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Practice Tip */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
          <span>Use Left / Right arrow keys to flip slides</span>
          <button
            onClick={onToggleMirror}
            className="text-purple-400 hover:text-purple-300 transition-colors font-semibold cursor-pointer"
          >
            Mirror: {isMirrored ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
