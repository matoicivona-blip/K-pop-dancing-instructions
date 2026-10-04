import React, { useEffect, useRef, useState } from 'react';
import { CameraPreset, DanceSceneController, initDanceStudioScene } from '../three/danceScene';
import { Camera, Smartphone, Maximize2, Rotate3d, CheckCircle2 } from 'lucide-react';

interface DanceStudioViewProps {
  currentCount: number;
  currentTitle: string;
  currentCue?: string;
  currentFootwork?: string;
  currentArmStyling?: string;
  isAccent?: boolean;
  isHoldingPose?: boolean;
  isMirrored: boolean;
  playbackSpeed: number;
  onSetController: (controller: DanceSceneController | null) => void;
  viewportMode: 'vertical_9_16' | 'full_width';
  onToggleViewportMode: () => void;
  onOpenGamified?: () => void;
}

export const DanceStudioView: React.FC<DanceStudioViewProps> = ({
  currentCount,
  currentTitle,
  currentCue,
  currentFootwork,
  currentArmStyling,
  isAccent,
  isHoldingPose,
  isMirrored,
  playbackSpeed,
  onSetController,
  viewportMode,
  onToggleViewportMode,
  onOpenGamified,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<DanceSceneController | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<CameraPreset>('stage_9_16');
  const [isManualOrbit, setIsManualOrbit] = useState(false);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let controller: DanceSceneController | null = null;
    try {
      controller = initDanceStudioScene(
        containerRef.current,
        () => setWebglError(true),
        () => setWebglError(false)
      );
      controllerRef.current = controller;
      onSetController(controller);
    } catch (err) {
      console.error('Failed to init 3D scene:', err);
      setWebglError(true);
    }

    const handleResize = () => {
      if (containerRef.current && controllerRef.current) {
        controllerRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (controller) {
        controller.dispose();
      }
      controllerRef.current = null;
      onSetController(null);
    };
  }, [onSetController]);

  // Handle camera preset changes
  const handleSelectCamPreset = (preset: CameraPreset) => {
    setActiveCamPreset(preset);
    setIsManualOrbit(false);
    if (controllerRef.current) {
      controllerRef.current.setCameraPreset(preset);
      controllerRef.current.enableManualOrbit(false);
    }
  };

  const handleToggleManualOrbit = () => {
    const next = !isManualOrbit;
    setIsManualOrbit(next);
    if (controllerRef.current) {
      controllerRef.current.enableManualOrbit(next);
    }
  };

  // Trigger resize when viewportMode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && controllerRef.current) {
        controllerRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [viewportMode]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* 3D Canvas Container */}
      <div
        className={`relative transition-all duration-300 flex items-center justify-center ${
          viewportMode === 'vertical_9_16'
            ? 'w-full h-full max-h-[82vh] sm:max-h-[86vh] max-w-[430px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-950/50 my-auto'
            : 'w-full h-full'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* WebGL Error / Fallback */}
        {webglError && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-30">
            <p className="text-amber-400 font-semibold mb-2">3D Graphic Acceleration Paused</p>
            <p className="text-xs text-slate-300 max-w-sm mb-4">
              WebGL context is reloading or suspended. Click below to re-initialize the dance studio.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-500 cursor-pointer"
            >
              Reload Scene
            </button>
          </div>
        )}

        {/* Top-Left Stage HUD: Live Beat & Count Cue */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
              <span className="text-sm font-black tracking-wider text-purple-200 uppercase tabular-nums">
                COUNT {currentCount}
              </span>
            </div>
            {playbackSpeed <= 0.6 && (
              <span className="bg-purple-950/80 border border-purple-500/60 text-purple-200 text-[11px] font-semibold px-2 py-1 rounded-md shadow">
                {playbackSpeed}x Beginner Pace
              </span>
            )}
            {isAccent && (
              <span className="bg-amber-500/90 text-slate-950 text-[11px] font-bold px-2 py-1 rounded-md shadow">
                HIT!
              </span>
            )}
            {isHoldingPose && (
              <span className="bg-purple-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow animate-pulse">
                HOLD 2s
              </span>
            )}
          </div>

          <div className="bg-slate-900/75 backdrop-blur-sm border border-slate-800/80 px-2.5 py-1 rounded-md max-w-[280px]">
            <p className="text-xs text-slate-200 font-medium truncate">{currentTitle}</p>
          </div>
        </div>

        {/* Top-Right HUD: Mirror badge & Mode toggle */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          {isMirrored && (
            <div className="bg-purple-950/80 backdrop-blur-sm border border-purple-600/60 px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-300">
              MIRRORED
            </div>
          )}
          <button
            onClick={onToggleViewportMode}
            title={viewportMode === 'vertical_9_16' ? 'Switch to Full Stage' : 'Switch to 9:16 Vertical Video'}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {viewportMode === 'vertical_9_16' ? <Maximize2 size={16} /> : <Smartphone size={16} />}
          </button>
        </div>

        {/* Written Step Text Billboard Floating Directly ABOVE the 3D Avatar */}
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm sm:max-w-md z-20 pointer-events-none transition-all duration-300">
          <div className="bg-slate-950/85 backdrop-blur-md border border-purple-500/50 rounded-xl p-2.5 sm:p-3 text-center shadow-2xl shadow-purple-950/80 space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                Count {currentCount} of 32
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
                {currentTitle}
              </span>
            </div>

            {currentCue && (
              <p className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow-sm px-1">
                "{currentCue}"
              </p>
            )}

            {(currentFootwork || currentArmStyling) && (
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-slate-300 pt-0.5 border-t border-slate-800/60">
                {currentFootwork && (
                  <span className="truncate max-w-[190px]">
                    <strong className="text-emerald-400 font-semibold">Feet:</strong> {currentFootwork}
                  </span>
                )}
                {currentFootwork && currentArmStyling && <span className="text-slate-600">·</span>}
                {currentArmStyling && (
                  <span className="truncate max-w-[190px]">
                    <strong className="text-cyan-400 font-semibold">Arms:</strong> {currentArmStyling}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Floating Bar: Camera View Presets */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-lg">
          <div className="flex items-center gap-1 px-1 text-slate-400 text-[11px]">
            <Camera size={13} />
            <span className="hidden sm:inline">Angle:</span>
          </div>

          <button
            onClick={() => handleSelectCamPreset('stage_9_16')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeCamPreset === 'stage_9_16' && !isManualOrbit
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            9:16 Stage
          </button>

          <button
            onClick={() => handleSelectCamPreset('front')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeCamPreset === 'front' && !isManualOrbit
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Front
          </button>

          <button
            onClick={() => handleSelectCamPreset('three_quarter')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeCamPreset === 'three_quarter' && !isManualOrbit
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            3/4 View
          </button>

          <button
            onClick={() => handleSelectCamPreset('profile')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeCamPreset === 'profile' && !isManualOrbit
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Profile
          </button>

          <button
            onClick={handleToggleManualOrbit}
            title="Free 360° Drag Orbit"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isManualOrbit
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Rotate3d size={14} />
          </button>

          {onOpenGamified && (
            <button
              onClick={onOpenGamified}
              title="Open Gamified Practice Mode"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>🎮 Practice Game</span>
            </button>
          )}
        </div>

        {/* 9:16 Phone View Framing Indicator */}
        {viewportMode === 'vertical_9_16' && (
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 pointer-events-none z-10 text-[10px] text-purple-400/60 font-mono tracking-wider flex items-center gap-1">
            <CheckCircle2 size={10} />
            <span>9:16 FULL-BODY VERTICAL STAGE</span>
          </div>
        )}
      </div>
    </div>
  );
};
