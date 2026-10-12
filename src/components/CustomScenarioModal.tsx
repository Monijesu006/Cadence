import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { Scenario } from '../types';

interface CustomScenarioModalProps {
  onClose: () => void;
  onScenarioCreated: (scenario: Scenario) => void;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  onClose,
  onScenarioCreated,
}) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Spanish');
  const [region, setRegion] = useState('Madrid / Peninsular Spain');
  const [isGenerating, setIsGenerating] = useState(false);

  const presets = [
    { title: 'Apartment Lease Negotiation', lang: 'French', region: 'Lyon, France' },
    { title: 'Ordering Craft Wine & Banter', lang: 'Italian', region: 'Tuscany, Italy' },
    { title: 'Academic Thesis Defense Inquiry', lang: 'Japanese', region: 'Tokyo, Japan' },
    { title: 'Street Food Haggling & Chat', lang: 'Spanish', region: 'Mexico City, Mexico' },
  ];

  const handleGenerate = async (presetTopic?: string, presetLang?: string, presetReg?: string) => {
    const finalTopic = presetTopic || topic;
    const finalLang = presetLang || language;
    const finalReg = presetReg || region;

    if (!finalTopic.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/scenario/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTopic: finalTopic,
          language: finalLang,
          dialectRegion: finalReg,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate scenario');
      const data = await res.json();

      // Lang code mapping helper
      const langCodes: Record<string, string> = {
        Spanish: 'es-ES',
        French: 'fr-FR',
        Japanese: 'ja-JP',
        Italian: 'it-IT',
        German: 'de-DE',
      };

      const newScenario: Scenario = {
        id: `custom-${Date.now()}`,
        title: data.title || finalTopic,
        category: (data.category as any) || 'social',
        language: finalLang,
        languageCode: langCodes[finalLang] || 'es-ES',
        dialectRegion: finalReg,
        location: data.location || finalReg,
        image: '/src/assets/images/hero_nuance_companion_1791815286083.jpg',
        characterName: data.characterName || 'Native Partner',
        characterRole: data.characterRole || 'Conversational Counterpart',
        characterBio: data.context || 'Local native who engages in authentic regional dialogue.',
        learnerRole: data.learnerRole || 'Intermediate language learner',
        context: data.context || finalTopic,
        goal: data.goal || 'Engage in natural conversation and apply authentic regional register.',
        recommendedRegister: (data.recommendedRegister?.toLowerCase() as any) || 'casual',
        difficulty: 'Intermediate B2',
        openingMessage: {
          text: data.openingMessage?.text || '¡Hola! ¿Cómo te va hoy?',
          translation: data.openingMessage?.translation || 'Hello! How are things going today?',
          phonetics: data.openingMessage?.phonetic || '',
        },
        initialEtiquetteNotes: data.initialEtiquetteNotes || ['Pay attention to conversational turn-taking.'],
        keyRegionalIdioms: data.keyRegionalIdioms || [],
      };

      onScenarioCreated(newScenario);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-500">
              <span>Scenario Studio</span>
              <span aria-hidden="true">·</span>
              <span>AI Synthesized Simulation</span>
            </div>
            <h2 className="text-xl font-bold font-display text-stone-900 mt-0.5">
              Generate Custom Nuance Scenario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 font-mono uppercase mb-1.5">
              Conversation Scenario or Setting:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Disputing a train fine with a conductor in Milan"
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 font-mono uppercase mb-1.5">
                Target Language:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Japanese">Japanese</option>
                <option value="Italian">Italian</option>
                <option value="German">German</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 font-mono uppercase mb-1.5">
                Dialect / Specific Region:
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Kansai, Paris, Buenos Aires"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Quick preset suggestions */}
          <div>
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wide block mb-2">
              Popular Intermediate Situations:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(p.title);
                    setLanguage(p.lang);
                    setRegion(p.region);
                  }}
                  className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-left hover:border-amber-400 transition-colors"
                >
                  <span className="text-xs font-semibold text-stone-900 block truncate">{p.title}</span>
                  <span className="text-[10px] text-stone-500 font-mono">{p.lang} · {p.region}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            Cancel
          </button>
          <button
            onClick={() => handleGenerate()}
            disabled={!topic.trim() || isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 disabled:opacity-40 transition-all shadow-xs"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Synthesizing...' : 'Generate & Start Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
