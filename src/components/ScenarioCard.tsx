import React from 'react';
import { Play, Sparkles, MapPin, User, ArrowUpRight } from 'lucide-react';
import { Scenario } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onSelect,
}) => {
  return (
    <article className="group relative bg-white border border-stone-200/90 rounded-xl overflow-hidden hover:border-stone-400/80 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Image Header with Scrim */}
        <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
          <img
            src={scenario.image}
            alt={scenario.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Graceful CSS fallback container
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-stone-800', 'flex', 'items-center', 'justify-center');
                const label = document.createElement('span');
                label.className = 'text-stone-400 text-xs font-mono';
                label.innerText = scenario.dialectRegion;
                parent.appendChild(label);
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent pointer-events-none" />

          {/* Region & Difficulty unboxed metadata overlay */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-stone-200">
            <span className="flex items-center gap-1 font-medium drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{scenario.location}</span>
            </span>
            <span className="font-mono text-[11px] text-amber-200 drop-shadow-sm">
              {scenario.difficulty}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Unboxed category and language metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span className="font-medium text-stone-700">{scenario.language}</span>
            <span aria-hidden="true">·</span>
            <span>{scenario.dialectRegion}</span>
          </div>

          <h3 className="text-lg font-semibold text-stone-900 font-display group-hover:text-amber-900 transition-colors">
            {scenario.title}
          </h3>

          <p className="mt-2 text-stone-600 text-xs leading-relaxed line-clamp-2">
            {scenario.context}
          </p>

          {/* Character & Register Context */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate font-medium text-stone-700">{scenario.characterName}</span>
              <span className="text-stone-400">({scenario.characterRole})</span>
            </div>
          </div>

          {/* Key Idiom Preview */}
          {scenario.keyRegionalIdioms && scenario.keyRegionalIdioms[0] && (
            <div className="mt-3 p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-xs">
              <span className="text-[10px] font-mono uppercase text-stone-400 block mb-0.5">Key Regional Idiom</span>
              <span className="font-medium text-stone-800 italic">"{scenario.keyRegionalIdioms[0].term}"</span>
              <span className="text-stone-500 block text-[11px] mt-0.5">{scenario.keyRegionalIdioms[0].meaning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onSelect(scenario)}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-amber-600 active:scale-98 transition-all shadow-xs"
        >
          <span>Start Simulation</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
