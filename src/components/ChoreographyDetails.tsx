import React, { useState } from 'react';
import { ChoreographyStep } from '../types/choreography';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Footprints, HandMetal, Info } from 'lucide-react';

interface ChoreographyDetailsProps {
  currentStep: ChoreographyStep;
  allSteps: ChoreographyStep[];
  onSelectCount: (count: number) => void;
}

export const ChoreographyDetails: React.FC<ChoreographyDetailsProps> = ({
  currentStep,
  allSteps,
  onSelectCount,
}) => {
  const [showFullChoreoList, setShowFullChoreoList] = useState(false);

  const prevCount = currentStep.count > 1 ? currentStep.count - 1 : 32;
  const nextCount = currentStep.count < 32 ? currentStep.count + 1 : 1;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 text-white shadow-xl flex flex-col gap-3">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm tabular-nums">
            {currentStep.count}
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100 leading-tight">
              {currentStep.title}
            </h3>
            <p className="text-xs text-purple-400 font-medium">
              Counts {((currentStep.setNumber - 1) * 8) + 1}–{currentStep.setNumber * 8} (Set {currentStep.setNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectCount(prevCount)}
            title="Previous count"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onSelectCount(nextCount)}
            title="Next count"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setShowFullChoreoList(!showFullChoreoList)}
            className="flex items-center gap-1 text-xs py-1.5 px-2.5 rounded-lg bg-purple-950/70 border border-purple-800/60 text-purple-300 hover:bg-purple-900 transition-colors cursor-pointer"
          >
            <BookOpen size={13} />
            <span>{showFullChoreoList ? 'Close Guide' : 'All 32'}</span>
          </button>
        </div>
      </div>

      {/* Official Choreography Cue */}
      <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-purple-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">Official Cue</span>
            <p className="text-sm font-medium text-purple-100 mt-0.5">
              "{currentStep.officialCue}"
            </p>
          </div>
        </div>
      </div>

      {/* Movement Breakdown: Footwork & Arm Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start gap-2">
          <Footprints size={15} className="text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-200 block">Footwork & Stance</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{currentStep.footwork}</p>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start gap-2">
          <HandMetal size={15} className="text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-200 block">Arm & Hand Styling</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{currentStep.armStyling}</p>
          </div>
        </div>
      </div>

      {/* Coaching Tip */}
      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 flex items-start gap-2 text-xs">
        <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300">Idol Coach Tip:</strong> {currentStep.coachingTip}
        </p>
      </div>

      {/* Full 32-Count Drawer Modal */}
      {showFullChoreoList && (
        <div className="mt-2 border-t border-slate-800 pt-3 max-h-64 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-400 mb-1 px-1">
            Complete 32-Count Routine Outline:
          </div>
          {allSteps.map((step) => {
            const isSelected = step.count === currentStep.count;
            return (
              <button
                key={step.count}
                onClick={() => onSelectCount(step.count)}
                className={`text-left text-xs p-2 rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono font-bold w-5 shrink-0 tabular-nums">
                    {step.count < 10 ? `0${step.count}` : step.count}
                  </span>
                  <span className="truncate">{step.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {step.count % 8 === 0 ? 'Accent Hit' : `Beat ${((step.count - 1) % 8) + 1}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
