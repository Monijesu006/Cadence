import React from 'react';
import { ArrowRight, Volume2, ShieldCheck, Compass } from 'lucide-react';

interface HeroBannerProps {
  onStartFeatured: () => void;
  onExploreAtlas: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartFeatured,
  onExploreAtlas,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-stone-900 text-stone-100 mb-10 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[380px]">
        {/* Left Column: Context & Editorial Headline */}
        <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between z-10">
          <div>
            {/* Clean unboxed editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300 mb-4">
              <span>Intermediate Conversational Mastery</span>
              <span aria-hidden="true">·</span>
              <span>B1 to C1 Fluency Bridge</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight leading-[1.15] text-stone-100 max-w-xl text-balance">
              Beyond textbook grammar. Master regional cadence & social register.
            </h1>

            <p className="mt-4 text-stone-300 text-base md:text-lg leading-relaxed max-w-lg">
              Navigate real-world conversations where textbook Spanish sounds robotic, French demands fine-tuned tutoiement, or Japanese calls for cushioning honorifics.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartFeatured}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-semibold text-sm hover:bg-amber-400 active:scale-95 transition-all shadow-md whitespace-nowrap"
            >
              <span>Practice Valencia Market</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreAtlas}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-700 bg-stone-800/80 text-stone-200 font-medium text-sm hover:bg-stone-800 hover:text-white transition-all whitespace-nowrap"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Browse Regional Idioms</span>
            </button>
          </div>

          {/* Quiet proof metrics strip */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 flex items-center gap-6 text-xs text-stone-400">
            <div>
              <span className="font-semibold text-stone-200">6 Dialect Regions</span> Peninsular, Rioplatense, Kansai, Paris & more
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <span className="font-semibold text-stone-200">5 Tone Registers</span> Street slang to diplomatic formality
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity Generated Hero Image with Fallback */}
        <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
          <img
            src="/src/assets/images/hero_nuance_companion_1791815286083.jpg"
            alt="Authentic conversational immersion in European café street"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Styled fallback if asset is missing
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-stone-800', 'flex', 'items-center', 'justify-center');
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-900 via-stone-900/40 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-md text-[11px] text-stone-300 border border-stone-700/60 max-w-xs">
            <span className="font-medium text-amber-300">Live Acoustic & Tone Analysis</span>
            <p className="text-stone-400 text-[10px] mt-0.5">Instant feedback on intonation, pauses, and regional slang usage.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
