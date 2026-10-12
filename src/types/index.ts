export type RegisterLevel = 'slang' | 'casual' | 'neutral' | 'polite' | 'formal';

export interface IdiomNote {
  term: string;
  literalMeaning: string;
  actualMeaning: string;
  region?: string;
  exampleSentence?: string;
}

export interface NativeAlternative {
  phrase: string;
  explanation: string;
}

export interface UserTurnFeedback {
  fluencyScore: number;
  registerVerdict: string;
  whatWorkedWell?: string;
  intermediatePitfall?: string;
  nativeAlternative: NativeAlternative;
  pronunciationKeypoints?: string[];
}

export interface CulturalNuance {
  socialEtiquette: string;
  registerLevel: string;
  bodyLanguageOrNonVerbal?: string;
  regionalSlangNotes?: IdiomNote[];
}

export interface SuggestedOption {
  register: string;
  phrase: string;
  translation: string;
  nuance: string;
}

export interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  phonetics?: string;
  timestamp: number;
  audioUrl?: string;
  feedback?: UserTurnFeedback;
  nuance?: CulturalNuance;
  cadenceNotes?: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: 'market' | 'business' | 'university' | 'social' | 'dining' | 'living';
  language: string;
  languageCode: string; // for Web Speech API (e.g. 'es-ES', 'ja-JP', 'fr-FR', 'it-IT')
  dialectRegion: string;
  location: string;
  image: string;
  characterName: string;
  characterRole: string;
  characterBio: string;
  learnerRole: string;
  context: string;
  goal: string;
  recommendedRegister: RegisterLevel;
  difficulty: 'Intermediate B1' | 'Intermediate B2' | 'Advanced C1';
  openingMessage: {
    text: string;
    translation: string;
    phonetics: string;
    cadenceNotes?: string[];
  };
  initialEtiquetteNotes: string[];
  keyRegionalIdioms: Array<{ term: string; meaning: string; literal?: string }>;
}

export interface SpeechAnalysisResult {
  overallScore: number;
  cadenceRating: string;
  toneRegisterAssessment: string;
  intonationSummary: string;
  phoneticBreakdown: Array<{
    word: string;
    phoneticGuide?: string;
    commonPitfall?: string;
    tip: string;
  }>;
  stressAndRhythmAdvice: string[];
  regionalAccentMarkers?: string[];
  improvedNativeVersion?: string;
  nativeAudioCadenceTip?: string;
}

export interface CulturalGuide {
  regionTitle: string;
  culturalMindset: string;
  unspokenEtiquetteRules: Array<{
    ruleTitle: string;
    explanation: string;
    practicalExample?: string;
  }>;
  regionalIdioms: Array<{
    idiom: string;
    literalTranslation: string;
    trueMeaning: string;
    exampleSentence: string;
    register: string;
  }>;
  registerSpectrum: Array<{
    intent: string;
    slang: string;
    casual: string;
    polite: string;
    formal: string;
  }>;
  socialTaboosAndPitfalls: Array<{
    trap: string;
    consequence: string;
    safeAlternative: string;
  }>;
  backchannelingAndPacing?: {
    listeningMarkers: string[];
    pauseTolerance: string;
    interruptionNorms: string;
  };
}
