import React from 'react';
import { CHOREOGRAPHY_SECTIONS } from '../types/choreography';
import {
  Sparkles,
  Layers,
  Sliders,
  Footprints,
  Eye,
  Volume2,
  Clock,
  ArrowRight,
  Tv,
} from 'lucide-react';

interface IntroPageProps {
  onStartSlides: () => void;
  onStartStudio: () => void;
  onStartDanceWithMe: () => void;
  onStartGamified: () => void;
  onStartWarmUp: () => void;
  onSelectSection: (sectionId: number) => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({
  onStartSlides,
  onStartStudio,
  onStartDanceWithMe,
  onStartGamified,
  onStartWarmUp,
  onSelectSection,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-800/40 p-6 sm:p-8 md:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-xs font-semibold text-purple-300">
              <Sparkles size={13} className="text-purple-400" />
              <span>Interactive 3D Choreography Tutorial</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Master the 32-Count K-Pop Dance Challenge at Your Own Pace
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Welcome to the official 3D K-Pop Dance Studio. Here, you can learn an original,
              beginner-friendly commercial dance routine performed by a full-body animated 3D dancer.
              Study each move with written cue text floating right above the avatar, slide-by-slide
              breakdowns at your own speed, and multi-angle camera views.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartWarmUp}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>🔥 Warm-Up Body Slides</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={onStartGamified}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-100 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <span>🎮 Gamified Practice</span>
              </button>

              <button
                onClick={onStartDanceWithMe}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-purple-200 bg-purple-900/60 hover:bg-purple-900 hover:text-white transition-colors border border-purple-700/60 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Dance Along</span>
              </button>

              <button
                onClick={onStartSlides}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Layers size={16} />
                <span>Step Slides</span>
              </button>

              <button
                onClick={onStartStudio}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Tv size={16} />
                <span>3D Studio</span>
              </button>
            </div>
          </div>

          {/* Decorative Background Glow */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
        </section>

        {/* What Is This Page & What Can You See? */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">What You Can Explore</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Four dedicated learning features designed to help absolute beginners master every count.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Layers size={20} />
              </div>
              <h3 className="font-semibold text-base text-slate-100">1. Step-by-Step Learning Slides</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Take complete control of your learning speed. Step through all 32 counts slide-by-slide
                with detailed footwork diagrams, arm styling instructions, and idol coach tips.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Eye size={20} />
              </div>
              <h3 className="font-semibold text-base text-slate-100">2. Full-Body 3D Animated Avatar</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Watch a stylized 3D dancer in a modern black and purple streetwear outfit with sporty sneakers.
                She stays clearly visible from head to sneaker soles at all times without clipping or camera zooms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <Sparkles size={20} />
              </div>
              <h3 className="font-semibold text-base text-slate-100">3. Written Steps Floating Above Avatar</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Never get lost on what to do. Clear written text displaying the exact step instruction,
                count number, and action name is displayed directly above the dancer in real time as she moves.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Sliders size={20} />
              </div>
              <h3 className="font-semibold text-base text-slate-100">4. Studio Mirror & Camera Orbit</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enable Mirror Mode to practice just like you would facing a dance studio mirror. Switch
                between 9:16 vertical stage, front view, side profile, or drag freely in full 360° 3D.
              </p>
            </div>
          </div>
        </section>

        {/* Choreography Outline Across 4 Parts */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Choreography Breakdown (Counts 1–32)</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Four manageable 8-count parts created specifically for beginners with no acrobatics or floor work.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHOREOGRAPHY_SECTIONS.map((sec) => (
              <div
                key={sec.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-600/50 transition-colors flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
                    <span>Part {sec.id}</span>
                    <span className="font-mono tabular-nums">Counts {sec.countRange[0]}–{sec.countRange[1]}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 mb-1.5">{sec.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sec.theme}</p>
                </div>

                <button
                  onClick={() => onSelectSection(sec.id)}
                  className="w-full mt-2 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Practice Part {sec.id}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Tips for Beginner Dancers */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm space-y-2">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Footprints size={16} className="text-purple-400" />
            <span>Tips for Your First Practice Session</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 pt-1">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span><strong>Start in Slide Mode:</strong> Step count-by-count at your own speed before trying full tempo.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span><strong>Turn on Mirror Mode:</strong> When the dancer steps to her right, you step to your right too.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span><strong>Watch the Text Above:</strong> Read the action cue floating over her head to anticipate each move.</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
