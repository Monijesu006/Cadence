/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ScenarioCard } from './components/ScenarioCard';
import { DialogueChamber } from './components/DialogueChamber';
import { SpeechClinicModal } from './components/SpeechClinicModal';
import { RegisterSwitcher } from './components/RegisterSwitcher';
import { CultureAtlas } from './components/CultureAtlas';
import { CustomScenarioModal } from './components/CustomScenarioModal';
import { DEFAULT_SCENARIOS } from './data/defaultScenarios';
import { Scenario, RegisterLevel } from './types';
import { Compass, Filter, Sparkles, BookOpen, Mic } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'simulations' | 'register' | 'atlas' | 'clinic'>('simulations');
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Clinic Modal State
  const [clinicState, setClinicState] = useState<{
    isOpen: boolean;
    initialText: string;
    scenario: Scenario;
    targetRegister: RegisterLevel;
  } | null>(null);

  const handleSelectScenario = (sc: Scenario) => {
    setActiveScenario(sc);
    setCurrentTab('simulations');
  };

  const handleOpenClinic = (userText: string, scenario: Scenario, targetRegister: RegisterLevel) => {
    setClinicState({
      isOpen: true,
      initialText: userText,
      scenario,
      targetRegister,
    });
  };

  const handleScenarioCreated = (newScenario: Scenario) => {
    setScenarios((prev) => [newScenario, ...prev]);
    setIsCustomModalOpen(false);
    setActiveScenario(newScenario);
    setCurrentTab('simulations');
  };

  // Filter scenarios
  const filteredScenarios = scenarios.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesLang = selectedLanguage === 'all' || s.language.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesCategory && matchesLang;
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-stone-900">
      {/* Top Bar Contract Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'simulations') {
            setActiveScenario(null);
          }
        }}
        onOpenNewScenario={() => setIsCustomModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If user is actively playing a scenario simulation in 'simulations' tab */}
        {currentTab === 'simulations' && activeScenario ? (
          <DialogueChamber
            scenario={activeScenario}
            onBack={() => setActiveScenario(null)}
            onOpenClinic={handleOpenClinic}
          />
        ) : currentTab === 'simulations' ? (
          <div className="space-y-10">
            {/* Hero Section with High-Fidelity Asset */}
            <HeroBanner
              onStartFeatured={() => handleSelectScenario(DEFAULT_SCENARIOS[0])}
              onExploreAtlas={() => setCurrentTab('atlas')}
            />

            {/* Scenario Explorer Filter Strip (Interactive buttons, not static pills) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-bold font-display text-stone-900">
                    Real-World Contextual Simulations
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select a scenario where textbook phrases fail and regional nuance takes over.
                  </p>
                </div>

                {/* Language Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-medium">
                  {['all', 'Spanish', 'Japanese', 'French', 'Italian', 'German'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap capitalize ${
                        selectedLanguage === lang
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'all' ? 'All Languages' : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Category Filter */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-stone-400 uppercase text-[11px] mr-1">Setting:</span>
                {[
                  { id: 'all', label: 'All Settings' },
                  { id: 'market', label: 'Local Markets' },
                  { id: 'business', label: 'Business & Negotiation' },
                  { id: 'university', label: 'University Seminars' },
                  { id: 'social', label: 'Social & Cafés' },
                  { id: 'dining', label: 'Dining & Aperitivo' },
                  { id: 'living', label: 'Apartment Hunting' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-xs font-semibold'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={handleSelectScenario}
                />
              ))}
            </div>
          </div>
        ) : currentTab === 'register' ? (
          <RegisterSwitcher />
        ) : currentTab === 'atlas' ? (
          <CultureAtlas />
        ) : currentTab === 'clinic' ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-500 mb-1">
                <span>Speech Clinic</span>
                <span aria-hidden="true">·</span>
                <span>Direct Diagnostic Workbench</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-stone-900">
                Speech & Tone Analysis Clinic
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Test your spoken Spanish, French, Japanese, Italian, or German. Get real-time acoustic feedback, syllable stress warnings, and register suitability.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
              <span className="text-xs font-semibold font-mono uppercase text-stone-700 block">
                Select A Simulation to Practice Speech:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.slice(0, 4).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleOpenClinic(sc.openingMessage.text, sc, sc.recommendedRegister)}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all text-left space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-semibold text-stone-800">{sc.language}</span>
                      <span className="font-mono text-[10px]">{sc.dialectRegion}</span>
                    </div>
                    <div className="text-sm font-bold text-stone-900 font-display">
                      {sc.title}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1 italic">
                      "{sc.openingMessage.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 font-display">Cadence</span>
            <span aria-hidden="true">·</span>
            <span>Intermediate Nuance & Dialect Companion</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Valencia</span>
            <span aria-hidden="true">·</span>
            <span>Kyoto</span>
            <span aria-hidden="true">·</span>
            <span>Paris</span>
            <span aria-hidden="true">·</span>
            <span>Buenos Aires</span>
            <span aria-hidden="true">·</span>
            <span>Milan</span>
          </div>
        </div>
      </footer>

      {/* Custom Scenario Modal */}
      {isCustomModalOpen && (
        <CustomScenarioModal
          onClose={() => setIsCustomModalOpen(false)}
          onScenarioCreated={handleScenarioCreated}
        />
      )}

      {/* Speech Clinic Modal */}
      {clinicState?.isOpen && (
        <SpeechClinicModal
          initialText={clinicState.initialText}
          scenario={clinicState.scenario}
          targetRegister={clinicState.targetRegister}
          onClose={() => setClinicState(null)}
        />
      )}
    </div>
  );
}
