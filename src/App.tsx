import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DanceSceneController } from './three/danceScene';
import { CHOREOGRAPHY_STEPS } from './three/dancePoses';
import { CHOREOGRAPHY_SECTIONS } from './types/choreography';
import { kpopAudio } from './audio/kpopBeat';
import { DanceStudioView } from './components/DanceStudioView';
import { ChoreographyTimeline } from './components/ChoreographyTimeline';
import { ChoreographyDetails } from './components/ChoreographyDetails';
import { PlaybackControls } from './components/PlaybackControls';
import { IntroPage } from './components/IntroPage';
import { SlideLearningView } from './components/SlideLearningView';
import { DanceWithMeView } from './components/DanceWithMeView';
import { GamifiedPracticeView } from './components/GamifiedPracticeView';
import { WarmUpView } from './components/WarmUpView';
import { Music, Sparkles, BookOpen, Layers, Tv, Flame, Trophy } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'warmup' | 'slides' | 'dance-with-me' | 'gamified' | 'studio'>('studio');
  const [controller, setController] = useState<DanceSceneController | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.6); // Default to beginner-friendly slow tempo (60 BPM)
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceCountEnabled, setIsVoiceCountEnabled] = useState<boolean>(true);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(1);
  const [isHoldingPose, setIsHoldingPose] = useState<boolean>(false);
  const [viewportMode, setViewportMode] = useState<'vertical_9_16' | 'full_width'>('vertical_9_16');

  // Animation timeline state in seconds
  const playbackTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const lastBeatCountRef = useRef<number>(1);
  const reqAnimIdRef = useRef<number | null>(null);

  const BEAT_DURATION = 0.6; // 100 BPM = 0.6s per beat
  const FINAL_HOLD = 2.0; // 2 seconds hold on count 32

  // Calculate start time and duration for each count
  const getStepTiming = useCallback(
    (countIndex: number) => {
      let startTime = 0;
      for (let i = 0; i < countIndex; i++) {
        const step = CHOREOGRAPHY_STEPS[i];
        const dur = (step.holdTime || 0) > 0 ? BEAT_DURATION + FINAL_HOLD : BEAT_DURATION;
        startTime += dur;
      }
      const thisStep = CHOREOGRAPHY_STEPS[countIndex];
      const duration = (thisStep.holdTime || 0) > 0 ? BEAT_DURATION + FINAL_HOLD : BEAT_DURATION;
      return { startTime, duration };
    },
    [BEAT_DURATION, FINAL_HOLD]
  );

  // Calculate section bounds
  const getLoopBounds = useCallback(() => {
    if (activeSectionId === null) {
      let total = 0;
      for (let i = 0; i < CHOREOGRAPHY_STEPS.length; i++) {
        const s = CHOREOGRAPHY_STEPS[i];
        total += (s.holdTime || 0) > 0 ? BEAT_DURATION + FINAL_HOLD : BEAT_DURATION;
      }
      return { start: 0, end: total, startCount: 1, endCount: 32 };
    }

    const sec = CHOREOGRAPHY_SECTIONS.find((s) => s.id === activeSectionId)!;
    const startCount = sec.countRange[0];
    const endCount = sec.countRange[1];

    const { startTime: start } = getStepTiming(startCount - 1);
    const { startTime: endStart, duration: endDur } = getStepTiming(endCount - 1);
    const end = endStart + endDur;

    return { start, end, startCount, endCount };
  }, [activeSectionId, getStepTiming, BEAT_DURATION, FINAL_HOLD]);

  // Jump to specific count
  const handleSelectCount = useCallback(
    (countNumber: number) => {
      const { startTime } = getStepTiming(countNumber - 1);
      playbackTimeRef.current = startTime + 0.01;
      lastBeatCountRef.current = countNumber;
      setCurrentCount(countNumber);
      setIsHoldingPose(countNumber === 32);

      if (controller) {
        controller.setPlaybackTime(startTime);
      }

      // Audio cue for targeted move
      kpopAudio.playBeat(countNumber, CHOREOGRAPHY_STEPS[countNumber - 1]?.isAccent);
    },
    [controller, getStepTiming]
  );

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Reset to beginning of current loop
  const handleReset = useCallback(() => {
    const { start, startCount } = getLoopBounds();
    playbackTimeRef.current = start;
    lastBeatCountRef.current = startCount;
    setCurrentCount(startCount);
    setIsHoldingPose(false);
    if (controller) {
      controller.setPlaybackTime(start);
    }
  }, [controller, getLoopBounds]);

  // Step backward 1 count
  const handleStepBack = useCallback(() => {
    const prev = currentCount > 1 ? currentCount - 1 : 32;
    handleSelectCount(prev);
  }, [currentCount, handleSelectCount]);

  // Step forward 1 count
  const handleStepForward = useCallback(() => {
    const next = currentCount < 32 ? currentCount + 1 : 1;
    handleSelectCount(next);
  }, [currentCount, handleSelectCount]);

  // Mirror mode toggle
  const handleToggleMirror = useCallback(() => {
    setIsMirrored((prev) => {
      const next = !prev;
      if (controller) {
        controller.setMirrorMode(next);
      }
      return next;
    });
  }, [controller]);

  // Audio settings
  const handleToggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      kpopAudio.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleVoiceCount = useCallback(() => {
    setIsVoiceCountEnabled((prev) => {
      const next = !prev;
      kpopAudio.setCountVoiceEnabled(next);
      return next;
    });
  }, []);

  // Speed setting
  const handleChangeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    kpopAudio.setSpeed(speed);
  }, []);

  // Section selection
  const handleSelectSection = useCallback(
    (secId: number | null) => {
      setActiveSectionId(secId);
      if (secId !== null) {
        const sec = CHOREOGRAPHY_SECTIONS.find((s) => s.id === secId);
        if (sec) {
          handleSelectCount(sec.countRange[0]);
        }
      }
    },
    [handleSelectCount]
  );

  // Spacebar and arrow key shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepBack();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMirror();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleStepBack, handleStepForward, handleToggleMirror]);

  // Main animation and beat synchronization loop
  useEffect(() => {
    const animate = (time: number) => {
      const deltaSeconds = Math.min(0.1, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (controller) {
        const isContinuousMode =
          activeTab === 'studio' || activeTab === 'dance-with-me' || activeTab === 'gamified';
        if (isPlaying && isContinuousMode) {
          playbackTimeRef.current += deltaSeconds * playbackSpeed;

          const { start, end } = getLoopBounds();

          // Loop if reached end
          if (playbackTimeRef.current >= end) {
            playbackTimeRef.current = start;
          } else if (playbackTimeRef.current < start) {
            playbackTimeRef.current = start;
          }

          const curTime = playbackTimeRef.current;

          // Determine which count we are on
          let detectedCount = 1;
          for (let i = 0; i < CHOREOGRAPHY_STEPS.length; i++) {
            const { startTime, duration } = getStepTiming(i);
            if (curTime >= startTime && curTime < startTime + duration) {
              detectedCount = i + 1;
              break;
            }
          }

          // Check if holding pose (Count 32 hold 2s)
          const isHolding = detectedCount === 32 && curTime >= getStepTiming(31).startTime + BEAT_DURATION;
          setIsHoldingPose(isHolding);

          // If count changed, fire audio beat
          if (detectedCount !== lastBeatCountRef.current) {
            lastBeatCountRef.current = detectedCount;
            setCurrentCount(detectedCount);
            const step = CHOREOGRAPHY_STEPS[detectedCount - 1];
            kpopAudio.playBeat(detectedCount, step?.isAccent);
          }

          controller.setPlaybackTime(curTime);
        }

        // In warm-up mode, WarmUpView manages its own smooth physical oscillation
        if (activeTab !== 'warmup') {
          controller.updateAnimation(deltaSeconds);
        }
      }

      reqAnimIdRef.current = requestAnimationFrame(animate);
    };

    reqAnimIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqAnimIdRef.current) {
        cancelAnimationFrame(reqAnimIdRef.current);
      }
    };
  }, [controller, isPlaying, activeTab, playbackSpeed, getLoopBounds, getStepTiming, BEAT_DURATION]);

  const currentStep = CHOREOGRAPHY_STEPS[currentCount - 1] || CHOREOGRAPHY_STEPS[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-30 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
            K-Pop 3D Dance Studio
          </span>
        </div>

        {/* Zone 2: Navigation modes */}
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-2.5 text-xs font-medium text-slate-400 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveTab('intro')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-lg whitespace-nowrap ${
              activeTab === 'intro' ? 'text-purple-400 font-semibold bg-purple-950/60 border border-purple-800/60' : ''
            }`}
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Intro & Guide</span>
            <span className="sm:hidden">Intro</span>
          </button>

          <button
            onClick={() => setActiveTab('warmup')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2.5 rounded-lg whitespace-nowrap ${
              activeTab === 'warmup'
                ? 'text-amber-300 font-semibold bg-amber-950/80 border border-amber-500/70 shadow-sm'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Flame size={14} className="text-amber-400" />
            <span className="font-semibold">Warm-Up Slides</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-lg whitespace-nowrap ${
              activeTab === 'slides' ? 'text-purple-400 font-semibold bg-purple-950/60 border border-purple-800/60' : ''
            }`}
          >
            <Layers size={14} />
            <span>Step Slides</span>
          </button>

          <button
            onClick={() => setActiveTab('gamified')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-lg whitespace-nowrap ${
              activeTab === 'gamified'
                ? 'text-amber-300 font-semibold bg-amber-950/80 border border-amber-500/70 shadow-sm'
                : 'hover:text-white'
            }`}
          >
            <Trophy size={14} />
            <span>Gamified</span>
          </button>

          <button
            onClick={() => setActiveTab('dance-with-me')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-lg whitespace-nowrap ${
              activeTab === 'dance-with-me'
                ? 'text-purple-300 font-semibold bg-purple-950/60 border border-purple-600/60 shadow-sm'
                : 'hover:text-white'
            }`}
          >
            <span>Dance With Me</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-lg whitespace-nowrap ${
              activeTab === 'studio' ? 'text-purple-400 font-semibold bg-purple-950/60 border border-purple-800/60' : ''
            }`}
          >
            <Tv size={14} />
            <span>3D Studio</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMirror}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              isMirrored
                ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            Mirror {isMirrored ? 'ON' : 'OFF'}
          </button>

          {activeTab !== 'warmup' ? (
            <button
              onClick={() => setActiveTab('warmup')}
              className="hidden xs:flex px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap cursor-pointer items-center gap-1.5"
            >
              <Flame size={13} />
              <span>Warm Up First</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('studio')}
              className="hidden xs:flex px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors shadow-md shadow-purple-600/30 whitespace-nowrap cursor-pointer items-center gap-1.5"
            >
              <Tv size={13} />
              <span>Start Routine</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout based on Active Tab */}
      {activeTab === 'intro' ? (
        <IntroPage
          onStartSlides={() => setActiveTab('slides')}
          onStartStudio={() => setActiveTab('studio')}
          onStartDanceWithMe={() => setActiveTab('dance-with-me')}
          onStartGamified={() => setActiveTab('gamified')}
          onStartWarmUp={() => setActiveTab('warmup')}
          onSelectSection={(secId) => {
            setActiveTab('slides');
            handleSelectSection(secId);
          }}
        />
      ) : activeTab === 'warmup' ? (
        <WarmUpView
          controller={controller}
          onSetController={setController}
          isMirrored={isMirrored}
          onToggleMirror={handleToggleMirror}
          viewportMode={viewportMode}
          onToggleViewportMode={() =>
            setViewportMode((prev) => (prev === 'vertical_9_16' ? 'full_width' : 'vertical_9_16'))
          }
          onFinishWarmUp={() => setActiveTab('studio')}
        />
      ) : activeTab === 'slides' ? (
        <SlideLearningView
          currentCount={currentCount}
          allSteps={CHOREOGRAPHY_STEPS}
          onSelectCount={handleSelectCount}
          controller={controller}
          onSetController={setController}
          isMirrored={isMirrored}
          onToggleMirror={handleToggleMirror}
          viewportMode={viewportMode}
          onToggleViewportMode={() =>
            setViewportMode((prev) => (prev === 'vertical_9_16' ? 'full_width' : 'vertical_9_16'))
          }
          onOpenWarmUp={() => setActiveTab('warmup')}
        />
      ) : activeTab === 'gamified' ? (
        <GamifiedPracticeView
          currentCount={currentCount}
          allSteps={CHOREOGRAPHY_STEPS}
          controller={controller}
          onSetController={setController}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={handleChangeSpeed}
          isMirrored={isMirrored}
          onToggleMirror={handleToggleMirror}
          viewportMode={viewportMode}
          onToggleViewportMode={() =>
            setViewportMode((prev) => (prev === 'vertical_9_16' ? 'full_width' : 'vertical_9_16'))
          }
          onSelectCount={handleSelectCount}
        />
      ) : activeTab === 'dance-with-me' ? (
        <DanceWithMeView
          currentCount={currentCount}
          allSteps={CHOREOGRAPHY_STEPS}
          controller={controller}
          onSetController={setController}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={handleChangeSpeed}
          isMirrored={isMirrored}
          onToggleMirror={handleToggleMirror}
          isAudioMuted={isAudioMuted}
          onToggleAudio={handleToggleAudio}
          isVoiceCountEnabled={isVoiceCountEnabled}
          onToggleVoiceCount={handleToggleVoiceCount}
          viewportMode={viewportMode}
          onToggleViewportMode={() =>
            setViewportMode((prev) => (prev === 'vertical_9_16' ? 'full_width' : 'vertical_9_16'))
          }
        />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left / Center 3D Stage Viewport */}
          <main className="flex-1 flex flex-col relative min-h-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2 sm:p-4 overflow-hidden">
            <DanceStudioView
              currentCount={currentCount}
              currentTitle={currentStep.title}
              currentCue={currentStep.officialCue}
              currentFootwork={currentStep.footwork}
              currentArmStyling={currentStep.armStyling}
              isAccent={currentStep.isAccent}
              isHoldingPose={isHoldingPose}
              isMirrored={isMirrored}
              playbackSpeed={playbackSpeed}
              onSetController={setController}
              viewportMode={viewportMode}
              onToggleViewportMode={() =>
                setViewportMode((prev) => (prev === 'vertical_9_16' ? 'full_width' : 'vertical_9_16'))
              }
              onOpenGamified={() => setActiveTab('gamified')}
            />
          </main>

          {/* Right Tutorial Sidebar (Scrubber, Controls & Move Breakdown) */}
          <aside className="w-full lg:w-[460px] xl:w-[500px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/95 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto shrink-0 custom-scrollbar">
            {/* Choreography Details Card for Current Count */}
            <ChoreographyDetails
              currentStep={currentStep}
              allSteps={CHOREOGRAPHY_STEPS}
              onSelectCount={handleSelectCount}
            />

            {/* 32-Count Interactive Timeline */}
            <ChoreographyTimeline
              currentCount={currentCount}
              steps={CHOREOGRAPHY_STEPS}
              activeSectionId={activeSectionId}
              onSelectCount={handleSelectCount}
              onSelectSection={handleSelectSection}
            />

            {/* Playback Transport & Audio Settings */}
            <PlaybackControls
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onStepBack={handleStepBack}
              onStepForward={handleStepForward}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={handleChangeSpeed}
              isMirrored={isMirrored}
              onToggleMirror={handleToggleMirror}
              isAudioMuted={isAudioMuted}
              onToggleAudio={handleToggleAudio}
              isVoiceCountEnabled={isVoiceCountEnabled}
              onToggleVoiceCount={handleToggleVoiceCount}
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              isHoldingPose={isHoldingPose}
            />

            {/* Quick Helper Notes */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1 border-t border-slate-800/60">
              <span>Space: Play/Pause · Arrows: Step · M: Mirror</span>
              <span className="flex items-center gap-1 text-purple-400">
                <Music size={11} />
                <span>Beginner Tempo (~60 BPM)</span>
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
