import React from 'react';
import { CHOREOGRAPHY_SECTIONS, ChoreographyStep } from '../types/choreography';

interface ChoreographyTimelineProps {
  currentCount: number;
  steps: ChoreographyStep[];
  activeSectionId: number | null;
  onSelectCount: (count: number) => void;
  onSelectSection: (sectionId: number | null) => void;
}

export const ChoreographyTimeline: React.FC<ChoreographyTimelineProps> = ({
  currentCount,
  steps,
  activeSectionId,
  onSelectCount,
  onSelectSection,
}) => {
  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 md:p-4 text-white shadow-xl">
      {/* Section tabs */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onSelectSection(null)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSectionId === null
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            All (1–32)
          </button>
          {CHOREOGRAPHY_SECTIONS.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Part {sec.id} ({sec.countRange[0]}–{sec.countRange[1]})
              </button>
            );
          })}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 shrink-0 tabular-nums">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          <span>Count {currentCount} / 32</span>
        </div>
      </div>

      {/* 32 Count Scrubber Grid */}
      <div className="grid grid-cols-8 sm:grid-cols-16 md:grid-cols-32 gap-1 md:gap-1.5">
        {steps.map((step) => {
          const isCurrent = step.count === currentCount;
          const isAccent = step.isAccent;
          const isSectionBoundary = step.count % 8 === 0;

          return (
            <button
              key={step.count}
              onClick={() => onSelectCount(step.count)}
              title={`Count ${step.count}: ${step.title}`}
              className={`relative h-10 md:h-12 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-purple-500 text-white font-bold ring-2 ring-purple-300 scale-105 z-10 shadow-lg shadow-purple-500/30'
                  : step.count < currentCount
                  ? 'bg-slate-800/90 text-purple-200 hover:bg-slate-700'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/60'
              } ${isSectionBoundary ? 'border-r-2 border-purple-400/40' : ''}`}
            >
              <span className="text-[11px] md:text-xs font-semibold tabular-nums">{step.count}</span>
              {isAccent && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isCurrent ? 'bg-yellow-300' : 'bg-purple-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Count Info Bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="truncate pr-2">
          <span className="font-semibold text-purple-400">Count {currentCount}:</span>{' '}
          <span className="text-slate-200">{steps[currentCount - 1]?.title}</span>
        </div>
        <div className="shrink-0 text-slate-400 hidden xs:block">
          <span>Set {steps[currentCount - 1]?.setNumber} of 4</span>
          <span className="mx-1.5">·</span>
          <span>Beat {((currentCount - 1) % 8) + 1} of 8</span>
        </div>
      </div>
    </div>
  );
};
