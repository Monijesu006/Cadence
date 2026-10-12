import React from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: 'simulations' | 'register' | 'atlas' | 'clinic';
  onSelectTab: (tab: 'simulations' | 'register' | 'atlas' | 'clinic') => void;
  onOpenNewScenario: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewScenario,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => onSelectTab('simulations')}
          className="text-xl font-bold tracking-tight text-stone-900 font-display hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          Cadence
        </button>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onSelectTab('simulations')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              currentTab === 'simulations'
                ? 'text-amber-900 border-amber-800 font-semibold'
                : 'text-stone-600 border-transparent hover:text-stone-900'
            }`}
          >
            Dialogue Simulations
          </button>
          <button
            onClick={() => onSelectTab('register')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              currentTab === 'register'
                ? 'text-amber-900 border-amber-800 font-semibold'
                : 'text-stone-600 border-transparent hover:text-stone-900'
            }`}
          >
            Register Switcher
          </button>
          <button
            onClick={() => onSelectTab('atlas')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              currentTab === 'atlas'
                ? 'text-amber-900 border-amber-800 font-semibold'
                : 'text-stone-600 border-transparent hover:text-stone-900'
            }`}
          >
            Culture & Idiom Atlas
          </button>
          <button
            onClick={() => onSelectTab('clinic')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              currentTab === 'clinic'
                ? 'text-amber-900 border-amber-800 font-semibold'
                : 'text-stone-600 border-transparent hover:text-stone-900'
            }`}
          >
            Speech & Tone Clinic
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewScenario}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Custom Scenario</span>
          </button>
        </div>
      </div>
    </header>
  );
};
