import React, { useState } from 'react';
import { Volume2, Sparkles, ArrowRight, BookOpen, Layers, Check, Globe } from 'lucide-react';
import { speechService } from '../utils/speech';

interface RegisterTier {
  level: string;
  badge: string;
  phrase: string;
  literal: string;
  socialContext: string;
  audioLanguageCode: string;
}

const PRESET_CONCEPTS = [
  {
    concept: 'Expressing Disagreement',
    language: 'French (Parisian)',
    languageCode: 'fr-FR',
    tiers: [
      {
        level: 'Street / Argot',
        badge: 'Slang',
        phrase: "N'importe quoi, c'est du grand délire !",
        literal: 'Whatever, it is big madness!',
        socialContext: 'With very close friends or peers. Highly passionate, informal dismissal.',
        audioLanguageCode: 'fr-FR',
      },
      {
        level: 'Colloquial / Casual',
        badge: 'Casual',
        phrase: "Franchement, je suis pas trop d'accord avec toi.",
        literal: 'Honestly, I am not too agreed with you.',
        socialContext: 'Informal student or friend setting. Notice the dropped "ne" (pas trop).',
        audioLanguageCode: 'fr-FR',
      },
      {
        level: 'Standard / Neutral',
        badge: 'Neutral',
        phrase: "Je ne partage pas cet avis.",
        literal: 'I do not share this opinion.',
        socialContext: 'Polite conversation with acquaintances or in a shop.',
        audioLanguageCode: 'fr-FR',
      },
      {
        level: 'Professional Polite',
        badge: 'Polite',
        phrase: "Je comprends votre point de vue, cependant j'aurais une réserve.",
        literal: 'I understand your perspective, however I would have a reservation.',
        socialContext: 'Corporate meeting. Uses "votre" (vouvoiement) with a polite conditional.',
        audioLanguageCode: 'fr-FR',
      },
      {
        level: 'Elevated Diplomatic',
        badge: 'Formal',
        phrase: "Il me semble opportun de nuancer cette appréciation.",
        literal: 'It seems opportune to me to nuance this appreciation.',
        socialContext: 'High academic seminar, state administration, legal or diplomatic writing.',
        audioLanguageCode: 'fr-FR',
      },
    ],
  },
  {
    concept: 'Turning Down an Invitation',
    language: 'Spanish (Peninsular vs Rioplatense)',
    languageCode: 'es-ES',
    tiers: [
      {
        level: 'Street / Colloquial (Spain)',
        badge: 'Slang',
        phrase: 'Buah, ni de coña, me da una pereza que te mueres.',
        literal: 'Bah, not even jokingly, it gives me a laziness that you die.',
        socialContext: 'Madrid/Valencia youth slang. Zero formality, total blunt closeness.',
        audioLanguageCode: 'es-ES',
      },
      {
        level: 'Casual (Buenos Aires / Voseo)',
        badge: 'Casual',
        phrase: 'Che, hoy se me re complica, no llego ni a palos.',
        literal: 'Hey, today it gets super complicated for me, I do not arrive even with sticks.',
        socialContext: 'Authentic Argentine casual. "Se me re complica" is universal Porteño phrasing.',
        audioLanguageCode: 'es-AR',
      },
      {
        level: 'Standard / Neutral',
        badge: 'Neutral',
        phrase: 'Lo siento, hoy no voy a poder ir.',
        literal: 'I feel it, today I will not be able to go.',
        socialContext: 'Standard everyday communication. Clear, polite, textbook-friendly.',
        audioLanguageCode: 'es-ES',
      },
      {
        level: 'Professional / Polite',
        badge: 'Polite',
        phrase: 'Le agradezco mucho la invitación, pero lamentablemente tengo un compromiso previo.',
        literal: 'I thank you much for the invitation, but unfortunately I have a prior commitment.',
        socialContext: 'Business dinner decline or formal coworker invitation.',
        audioLanguageCode: 'es-ES',
      },
      {
        level: 'High Formal / Protocol',
        badge: 'Formal',
        phrase: 'Lamento comunicarle la imposibilidad de asistir al evento previsto.',
        literal: 'I regret to communicate to you the impossibility of attending the planned event.',
        socialContext: 'Official corporate RSVP decline or diplomatic embassy note.',
        audioLanguageCode: 'es-ES',
      },
    ],
  },
  {
    concept: 'Saying Something is Too Expensive',
    language: 'Japanese (Kansai & Standard)',
    languageCode: 'ja-JP',
    tiers: [
      {
        level: 'Kansai Market Banter',
        badge: 'Slang / Dialect',
        phrase: 'これ、めっちゃ高ない？もうちょっとまけてぇな！',
        literal: 'This, super not expensive? Discount it a little bit for me, eh!',
        socialContext: 'Osaka/Kansai merchant banter. Friendly haggling with stall owners.',
        audioLanguageCode: 'ja-JP',
      },
      {
        level: 'Casual Peer',
        badge: 'Casual',
        phrase: 'えー、それ高すぎじゃない？予算オーバーだわ。',
        literal: 'Eh, isn’t that way too high? It is budget over.',
        socialContext: 'Shopping with close friends. Casual sentence-ending particle "だわ".',
        audioLanguageCode: 'ja-JP',
      },
      {
        level: 'Standard Polite (Teineigo)',
        badge: 'Neutral',
        phrase: '少し高価ですね。別の選択肢はありますか？',
        literal: 'It is a bit expensive, right? Are there other choices?',
        socialContext: 'Standard department store inquiry with clerk.',
        audioLanguageCode: 'ja-JP',
      },
      {
        level: 'Business Diplomatic (Kenjougo/Keigo)',
        badge: 'Polite',
        phrase: 'こちらの予算を少々上回っておりまして、再検討が必要かと存じます。',
        literal: 'It somewhat exceeds our budget, and I feel a reconsideration might be necessary.',
        socialContext: 'Procurement meeting. Uses cushioning "少々" and humble verb "存じます".',
        audioLanguageCode: 'ja-JP',
      },
      {
        level: 'High Formal Executive',
        badge: 'Formal',
        phrase: '提示価格につきましては、弊社の許容限度を超過している次第でございます。',
        literal: 'Concerning the presented price, it represents a situation of exceeding our tolerance limit.',
        socialContext: 'Written contract negotiation and executive committee deliberations.',
        audioLanguageCode: 'ja-JP',
      },
    ],
  },
  {
    concept: 'Asking Someone to Explain Again',
    language: 'Italian',
    languageCode: 'it-IT',
    tiers: [
      {
        level: 'Street / Roman Dialect',
        badge: 'Slang',
        phrase: 'Aò, ma che stai a di\'? Non c\'ho capito \'na mazza!',
        literal: 'Hey, what are you saying? I did not understand a club!',
        socialContext: 'Roman street banter with buddies. "Non c\'ho capito una mazza" is very colloquial.',
        audioLanguageCode: 'it-IT',
      },
      {
        level: 'Casual Peer',
        badge: 'Casual',
        phrase: 'Aspetta, me lo rispieghi? Mi sono perso un attimo.',
        literal: 'Wait, re-explain it to me? I got lost for a second.',
        socialContext: 'University study group or chat with colleague you use "tu" with.',
        audioLanguageCode: 'it-IT',
      },
      {
        level: 'Standard Polite',
        badge: 'Neutral',
        phrase: 'Può ripetere, per favore? Non ho afferrato l\'ultimo concetto.',
        literal: 'Can you repeat, please? I did not grasp the last concept.',
        socialContext: 'Polite conversation with a professor, shopkeeper, or client.',
        audioLanguageCode: 'it-IT',
      },
      {
        level: 'Professional Workplace',
        badge: 'Polite',
        phrase: 'Le dispiacerebbe chiarire questo passaggio prima di procedere?',
        literal: 'Would it displease you to clarify this step before proceeding?',
        socialContext: 'Formal business conference or executive briefing.',
        audioLanguageCode: 'it-IT',
      },
      {
        level: 'Elevated Formal',
        badge: 'Formal',
        phrase: 'Gradirei un ulteriore approfondimento circa i termini appena esposti.',
        literal: 'I would welcome further in-depth analysis concerning the terms just set forth.',
        socialContext: 'Legal deposition, official municipal council, or academic debate.',
        audioLanguageCode: 'it-IT',
      },
    ],
  },
];

export const RegisterSwitcher: React.FC = () => {
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const current = PRESET_CONCEPTS[selectedConceptIndex];

  const handlePlay = (phrase: string, langCode: string) => {
    setPlayingPhrase(phrase);
    speechService.speak(phrase, langCode, () => setPlayingPhrase(null), 0.92);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-500 mb-1">
          <span>Register Calibration</span>
          <span aria-hidden="true">·</span>
          <span>Sociolinguistic Spectrum</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-stone-900">
          The 5-Tier Conversational Register Switcher
        </h2>
        <p className="mt-2 text-sm text-stone-600 max-w-2xl leading-relaxed">
          The defining mark of an intermediate speaker is knowing <em>which</em> register to use. The exact same thought sounds wildly inappropriate if you use street slang in an interview or textbook formal grammar at an outdoor produce market.
        </p>
      </div>

      {/* Preset Concept Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        {PRESET_CONCEPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedConceptIndex(idx)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedConceptIndex === idx
                ? 'bg-stone-900 text-stone-50 shadow-xs font-semibold'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <span>{item.concept}</span>
            <span className="ml-1.5 opacity-60 text-[10px]">({item.language.split(' ')[0]})</span>
          </button>
        ))}
      </div>

      {/* Active Concept Card Header */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-amber-900 font-bold block">
            Target Thought: "{current.concept}"
          </span>
          <span className="text-xs text-stone-600">Language: {current.language}</span>
        </div>
        <span className="text-xs font-mono text-stone-500">5 Distinct Social Realities</span>
      </div>

      {/* 5-Tier Spectrum Visualizer */}
      <div className="space-y-4">
        {current.tiers.map((tier, idx) => {
          const tierColors: Record<string, string> = {
            'Slang': 'border-rose-200 bg-rose-50/30 text-rose-900',
            'Casual': 'border-amber-200 bg-amber-50/30 text-amber-900',
            'Neutral': 'border-stone-200 bg-white text-stone-900',
            'Polite': 'border-sky-200 bg-sky-50/30 text-sky-900',
            'Formal': 'border-indigo-200 bg-indigo-50/30 text-indigo-900',
          };

          const isPlaying = playingPhrase === tier.phrase;

          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all ${tierColors[tier.badge] || 'border-stone-200 bg-white'} hover:shadow-xs`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500">Tier 0{idx + 1}</span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-xs font-semibold text-stone-800">{tier.level}</span>
                </div>

                <button
                  onClick={() => handlePlay(tier.phrase, tier.audioLanguageCode)}
                  className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 font-medium py-1 px-2.5 rounded-md bg-white border border-stone-200 shadow-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-600 animate-pulse' : ''}`} />
                  <span>{isPlaying ? 'Playing...' : 'Pronounce'}</span>
                </button>
              </div>

              {/* Phrase Body */}
              <div className="text-base md:text-lg font-semibold text-stone-900 font-display mt-1">
                "{tier.phrase}"
              </div>

              {/* Literal and Context */}
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-600 pt-2 border-t border-stone-200/60">
                <div>
                  <span className="text-stone-400 font-mono text-[11px] block">Literal Translation:</span>
                  <span className="italic">{tier.literal}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-mono text-[11px] block">Social Context & Unspoken Rule:</span>
                  <span>{tier.socialContext}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
