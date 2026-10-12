import React, { useState, useEffect } from 'react';
import { Globe, BookOpen, AlertCircle, Sparkles, Volume2, ArrowRight, RefreshCw, Compass } from 'lucide-react';
import { CulturalGuide } from '../types';
import { speechService } from '../utils/speech';

interface DialectRegionOption {
  id: string;
  language: string;
  region: string;
  context: string;
  langCode: string;
}

const REGION_OPTIONS: DialectRegionOption[] = [
  {
    id: 'es-peninsular',
    language: 'Spanish',
    region: 'Peninsular Spain (Madrid & Valencia)',
    context: 'Direct street market banter, informal social closeness, tapeo culture',
    langCode: 'es-ES',
  },
  {
    id: 'es-rioplatense',
    language: 'Spanish',
    region: 'Argentina (Buenos Aires / Rioplatense)',
    context: 'Voseo, lunfardo slang, Italianate intonation, mate ritual',
    langCode: 'es-AR',
  },
  {
    id: 'ja-kansai',
    language: 'Japanese',
    region: 'Kansai / Kyoto & Osaka',
    context: 'Merchant humor, Kyoto indirectness, aizuchi pacing, cushioning words',
    langCode: 'ja-JP',
  },
  {
    id: 'fr-paris',
    language: 'French',
    region: 'Paris / Île-de-France',
    context: 'Academic debate, tutoiement vs vouvoiement boundaries, argot & verlan',
    langCode: 'fr-FR',
  },
  {
    id: 'it-milan',
    language: 'Italian',
    region: 'Milan & Northern Italy',
    context: 'Aperitivo ritual, conversational overlap as warmth, double consonants',
    langCode: 'it-IT',
  },
];

export const CultureAtlas: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<DialectRegionOption>(REGION_OPTIONS[0]);
  const [guide, setGuide] = useState<CulturalGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, CulturalGuide>>({});
  const [playingIdiom, setPlayingIdiom] = useState<string | null>(null);

  useEffect(() => {
    fetchGuide(selectedRegion);
  }, [selectedRegion]);

  const fetchGuide = async (opt: DialectRegionOption) => {
    if (cache[opt.id]) {
      setGuide(cache[opt.id]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/culture/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: opt.language,
          dialectRegion: opt.region,
          scenarioTitle: opt.context,
        }),
      });

      if (!res.ok) throw new Error('Failed to load cultural guide');
      const data: CulturalGuide = await res.json();
      setGuide(data);
      setCache((prev) => ({ ...prev, [opt.id]: data }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePronounce = (text: string) => {
    setPlayingIdiom(text);
    speechService.speak(text, selectedRegion.langCode, () => setPlayingIdiom(null), 0.9);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-500 mb-1">
          <span>Sociolinguistic Compendium</span>
          <span aria-hidden="true">·</span>
          <span>Regional Nuance</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-stone-900">
          Culture & Idiom Atlas
        </h2>
        <p className="mt-2 text-sm text-stone-600 max-w-2xl leading-relaxed">
          Deep-dive into the unspoken rules of etiquette, regional slang, conversational backchanneling, and social pitfalls that grammar books omit.
        </p>
      </div>

      {/* Region Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-xl">
        {REGION_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedRegion(opt)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
              selectedRegion.id === opt.id
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>{opt.region}</span>
            <span className="block text-[10px] text-stone-400 font-mono mt-0.5">{opt.language}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white border border-stone-200 rounded-2xl">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          <p className="text-sm font-medium text-stone-700">Synthesizing sociolinguistic briefing for {selectedRegion.region}...</p>
        </div>
      ) : guide ? (
        <div className="space-y-8 animate-in fade-in-50">
          {/* Mindset Card */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-amber-300 font-bold block mb-2">
              Conversational Mindset & Social Rhythm
            </span>
            <h3 className="text-xl md:text-2xl font-bold font-display leading-snug">
              {guide.regionTitle || selectedRegion.region}
            </h3>
            <p className="mt-3 text-stone-300 text-sm leading-relaxed max-w-3xl">
              {guide.culturalMindset}
            </p>
          </div>

          {/* Unwritten Etiquette Rules */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <h3 className="text-lg font-bold font-display text-stone-900">
                Unspoken Etiquette Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guide.unspokenEtiquetteRules.map((rule, idx) => (
                <div key={idx} className="p-5 bg-white border border-stone-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">Rule 0{idx + 1}</span>
                  <h4 className="text-sm font-bold text-stone-900">{rule.ruleTitle}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{rule.explanation}</p>
                  {rule.practicalExample && (
                    <div className="pt-2 border-t border-stone-100 text-[11px] text-amber-900 font-medium">
                      Example: {rule.practicalExample}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Regional Idioms & Slang */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-800" />
              <h3 className="text-lg font-bold font-display text-stone-900">
                Essential Regional Idioms & Slang
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.regionalIdioms.map((idiom, idx) => (
                <div key={idx} className="p-5 bg-white border border-stone-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-display text-stone-900 italic">
                      "{idiom.idiom}"
                    </span>
                    <button
                      onClick={() => handlePronounce(idiom.idiom)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
                      title="Pronounce idiom"
                    >
                      <Volume2 className={`w-4 h-4 ${playingIdiom === idiom.idiom ? 'text-amber-600 animate-pulse' : ''}`} />
                    </button>
                  </div>

                  <div className="text-xs text-stone-500">
                    <strong className="text-stone-700">Literal:</strong> {idiom.literalTranslation}
                  </div>
                  <div className="text-xs text-stone-900 font-medium">
                    <strong className="text-amber-800">Actual Meaning:</strong> {idiom.trueMeaning}
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 italic">
                    "{idiom.exampleSentence}"
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Social Taboos & Pitfalls */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-700" />
              <h3 className="text-lg font-bold font-display text-stone-900">
                Intermediate Social Pitfalls & Taboos
              </h3>
            </div>

            <div className="space-y-3">
              {guide.socialTaboosAndPitfalls.map((taboo, idx) => (
                <div key={idx} className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-rose-900 font-bold block mb-0.5">The Trap</span>
                    <span className="font-semibold text-stone-900">{taboo.trap}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-500 block mb-0.5">Why It Sounds Off</span>
                    <span className="text-stone-600">{taboo.consequence}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block mb-0.5">Safe Native Alternative</span>
                    <span className="font-medium text-emerald-950">{taboo.safeAlternative}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Backchanneling & Conversational Pacing */}
          {guide.backchannelingAndPacing && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold font-display text-stone-900">
                Conversational Rhythm & Listening Cues
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
                <div>
                  <span className="font-semibold text-stone-800 block mb-1">Listening Markers:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.backchannelingAndPacing.listeningMarkers.map((marker, mIdx) => (
                      <span key={mIdx} className="font-mono bg-white border border-stone-200 px-2 py-0.5 rounded text-[11px] text-stone-800">
                        {marker}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-stone-800 block mb-1">Pause Tolerance:</span>
                  <p>{guide.backchannelingAndPacing.pauseTolerance}</p>
                </div>
                <div>
                  <span className="font-semibold text-stone-800 block mb-1">Interruption & Overlap Norms:</span>
                  <p>{guide.backchannelingAndPacing.interruptionNorms}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
