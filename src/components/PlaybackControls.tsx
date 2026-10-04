import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Mic,
  MicOff,
  Gauge,
  Repeat,
} from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  isVoiceCountEnabled: boolean;
  onToggleVoiceCount: () => void;
  activeSectionId: number | null;
  onSelectSection: (sectionId: number | null) => void;
  isHoldingPose?: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  onStepBack,
  onStepForward,
  playbackSpeed,
  onChangeSpeed,
  isMirrored,
  onToggleMirror,
  isAudioMuted,
  onToggleAudio,
  isVoiceCountEnabled,
  onToggleVoiceCount,
  activeSectionId,
  onSelectSection,
  isHoldingPose,
}) => {
  const SPEED_PRESETS = [
    { value: 0.4, label: '0.4x', note: 'Breakdown' },
    { value: 0.6, label: '0.6x', note: 'Beginner' },
    { value: 0.75, label: '0.75x', note: 'Practice' },
    { value: 1.0, label: '1.0x', note: 'Normal' },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 md:p-4 text-white shadow-xl flex flex-col gap-3">
      {/* Primary Transport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Reset to Count 1"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={17} />
          </button>

          <button
            onClick={onStepBack}
            title="Step Back 1 Count (Left Arrow)"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <SkipBack size={17} />
          </button>

          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className={`px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 ring-2 ring-purple-400/40'
            }`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            <span>{isPlaying ? 'Pause' : 'Play Dance'}</span>
          </button>

          <button
            onClick={onStepForward}
            title="Step Forward 1 Count (Right Arrow)"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <SkipForward size={17} />
          </button>

          {isHoldingPose && (
            <span className="text-xs px-2.5 py-1 rounded bg-purple-900/80 text-purple-200 border border-purple-600/50 animate-pulse font-medium">
              Holding 2s Pose...
            </span>
          )}
        </div>

        {/* Beginner Speed Selectors */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-1 px-1.5 text-slate-400 text-xs font-medium">
            <Gauge size={13} />
            <span className="hidden sm:inline">Pace:</span>
          </div>
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onChangeSpeed(preset.value)}
              title={`${preset.label} (${preset.note})`}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1 ${
                playbackSpeed === preset.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>{preset.label}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline font-normal">({preset.note})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Auxiliary Settings Bar: Mirror, Loop, Audio & Voice */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
        {/* Mirror Mode & Audio */}
        <div className="flex items-center gap-2">
          {/* Mirror mode toggle */}
          <button
            onClick={onToggleMirror}
            title="Mirror Mode (Follow as if in dance mirror)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isMirrored
                ? 'bg-purple-900/60 border-purple-500 text-purple-200 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <FlipHorizontal size={14} />
            <span>Mirror Mode {isMirrored ? 'ON' : 'OFF'}</span>
          </button>

          {/* Beat Audio Mute */}
          <button
            onClick={onToggleAudio}
            title={isAudioMuted ? 'Unmute K-Pop Beats' : 'Mute Beats'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              !isAudioMuted
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>Beats</span>
          </button>

          {/* Voice Count Callout */}
          <button
            onClick={onToggleVoiceCount}
            title={isVoiceCountEnabled ? 'Voice count "1, 2, 3..." on' : 'Voice count off'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isVoiceCountEnabled
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isVoiceCountEnabled ? <Mic size={14} /> : <MicOff size={14} />}
            <span>Voice Cues</span>
          </button>
        </div>

        {/* Loop Section Selector */}
        <div className="flex items-center gap-1 text-slate-400">
          <Repeat size={13} className="text-purple-400" />
          <span className="hidden sm:inline">Loop:</span>
          <select
            value={activeSectionId ?? 'all'}
            onChange={(e) => {
              const val = e.target.value;
              onSelectSection(val === 'all' ? null : parseInt(val, 10));
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Full Routine (1–32)</option>
            <option value="1">Part 1: Intro Groove (1–8)</option>
            <option value="2">Part 2: Upward & Roll (9–16)</option>
            <option value="3">Part 3: Arm Circles & Hit (17–24)</option>
            <option value="4">Part 4: Climax & Ending (25–32)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
