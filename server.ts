import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON generation from Gemini
async function generateJson<T>(contents: string, systemInstruction: string, schema: any): Promise<T> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.7,
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as T;
}

// 1. Dialogue Simulator Endpoint
app.post('/api/dialogue/respond', async (req, res) => {
  try {
    const {
      scenarioTitle,
      scenarioContext,
      characterName,
      characterRole,
      language,
      dialectRegion,
      targetRegister,
      dialogueHistory = [],
      userMessage,
    } = req.body;

    const systemInstruction = `You are an expert native conversationalist and cultural linguist in ${language} (${dialectRegion}).
You are roleplaying as ${characterName}, who is ${characterRole}.
Context: ${scenarioContext}
The user is an intermediate learner who has already learned standard textbook grammar and vocabulary, but wants to master regional nuance, natural conversational pacing, authentic idioms, and register calibration (${targetRegister}).

Speak authentically in ${language} with ${dialectRegion} regional flavor, natural discourse markers (filler words, reactions), and appropriate cultural etiquette.

Respond with:
1. In-character response in ${language}.
2. English translation.
3. Pronunciation & cadence notes for this turn (liaisons, rhythm, silent vowels, regional sound shifts).
4. Culture & etiquette nuance breakdown (unspoken rules, social hierarchy, physical distance/gestures).
5. Regional slang/idioms highlighted with breakdown.
6. In-depth analysis of the user's latest statement:
   - Fluency score (0-100)
   - Naturalness assessment
   - Register fit (did it sound too robotic, overly formal, rude, or spot-on?)
   - Local Native Upgrade: How an authentic native in ${dialectRegion} would say what the user meant.
7. Three recommended next turn suggestions for the user in different registers (Colloquial, Natural Everyday, Formal/Polite).`;

    const formattedHistory = dialogueHistory
      .map((m: any) => `${m.role === 'user' ? 'Learner' : characterName}: ${m.text}`)
      .join('\n');

    const prompt = `Dialogue history:
${formattedHistory}

Learner's latest message in ${language}:
"${userMessage}"

Target register: ${targetRegister}
Dialect/Region: ${dialectRegion}

Generate the character's reply and comprehensive linguistic & cultural breakdown in JSON.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        characterReply: { type: Type.STRING, description: 'In-character response in the target language' },
        characterReplyTranslation: { type: Type.STRING, description: 'Natural English translation' },
        characterReplyPhonetics: { type: Type.STRING, description: 'Phonetic transcription or pronunciation guide' },
        cadenceAndRhythmNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key pronunciation rhythm points or regional accent features in this reply',
        },
        culturalNuance: {
          type: Type.OBJECT,
          properties: {
            socialEtiquette: { type: Type.STRING, description: 'The unwritten cultural rule or social norm in play' },
            registerLevel: { type: Type.STRING, description: 'Tone level: e.g. Ultra-colloquial, Casual, Warm-polite, Formal' },
            bodyLanguageOrNonVerbal: { type: Type.STRING, description: 'Typical non-verbal gesture, gaze, or reaction' },
            regionalSlangNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  literalMeaning: { type: Type.STRING },
                  actualMeaning: { type: Type.STRING },
                  region: { type: Type.STRING },
                },
                required: ['term', 'literalMeaning', 'actualMeaning'],
              },
            },
          },
          required: ['socialEtiquette', 'registerLevel'],
        },
        userTurnFeedback: {
          type: Type.OBJECT,
          properties: {
            fluencyScore: { type: Type.NUMBER, description: '0 to 100 fluency & naturalness score' },
            registerVerdict: { type: Type.STRING, description: 'Evaluation of user tone & formality' },
            whatWorkedWell: { type: Type.STRING, description: 'Compliment on accurate phrasing or vocabulary' },
            intermediatePitfall: { type: Type.STRING, description: 'Common intermediate mistake detected or textbook-stiffness note' },
            nativeAlternative: {
              type: Type.OBJECT,
              properties: {
                phrase: { type: Type.STRING, description: 'More natural regional way to say it' },
                explanation: { type: Type.STRING, description: 'Why this sounds significantly more native' },
              },
              required: ['phrase', 'explanation'],
            },
            pronunciationKeypoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Phonemes or syllable stress to watch for user sentence',
            },
          },
          required: ['fluencyScore', 'registerVerdict', 'nativeAlternative'],
        },
        suggestedUserOptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              register: { type: Type.STRING, description: 'Colloquial / Everyday Natural / Formal Polite' },
              phrase: { type: Type.STRING, description: 'Target language phrase' },
              translation: { type: Type.STRING, description: 'English translation' },
              nuance: { type: Type.STRING, description: 'When to use this register' },
            },
            required: ['register', 'phrase', 'translation', 'nuance'],
          },
        },
      },
      required: ['characterReply', 'characterReplyTranslation', 'culturalNuance', 'userTurnFeedback', 'suggestedUserOptions'],
    };

    const data = await generateJson(prompt, systemInstruction, schema);
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/dialogue/respond:', error);
    res.status(500).json({ error: error.message || 'Failed to process dialogue turn' });
  }
});

// 2. Speech & Tone Deep Analysis Endpoint
app.post('/api/speech/analyze', async (req, res) => {
  try {
    const {
      language,
      dialectRegion,
      targetRegister,
      scenarioTitle,
      userSpokenText,
      audioMetrics,
    } = req.body;

    const systemInstruction = `You are a clinical speech linguist and regional dialect coach for ${language} (${dialectRegion}).
Analyze intermediate language learners on pronunciation naturalness, intonation contours, conversational tempo, rhythm, and tone register compliance.`;

    const prompt = `Analyze this intermediate learner's spoken phrase:
"${userSpokenText}"

Context: Scenario is "${scenarioTitle}", Target Register is "${targetRegister}", Region is "${dialectRegion}".
Audio metrics reported: ${JSON.stringify(audioMetrics || {})}

Provide detailed speech and tone feedback:
- Overall pronunciation & fluency score (0-100)
- Cadence rating (e.g. Natural, Slightly Rushed, Monotone, Broken by pauses)
- Tone register check (e.g., Too abrupt, Excessively deferential, Spot-on conversational)
- Phonetic trouble spots with IPA or clear phonetic instructions
- Pitch contour & rhythm stress recommendations
- Regional sound shifts (how locals in ${dialectRegion} pronounce these sounds differently from standard textbook).`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER },
        cadenceRating: { type: Type.STRING },
        toneRegisterAssessment: { type: Type.STRING },
        intonationSummary: { type: Type.STRING },
        phoneticBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phoneticGuide: { type: Type.STRING },
              commonPitfall: { type: Type.STRING },
              tip: { type: Type.STRING },
            },
            required: ['word', 'tip'],
          },
        },
        stressAndRhythmAdvice: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        regionalAccentMarkers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        improvedNativeVersion: {
          type: Type.STRING,
        },
        nativeAudioCadenceTip: {
          type: Type.STRING,
        },
      },
      required: ['overallScore', 'cadenceRating', 'toneRegisterAssessment', 'phoneticBreakdown', 'stressAndRhythmAdvice'],
    };

    const data = await generateJson(prompt, systemInstruction, schema);
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/speech/analyze:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze speech' });
  }
});

// 3. Culture & Nuance Deep Dive Endpoint
app.post('/api/culture/deep-dive', async (req, res) => {
  try {
    const { language, dialectRegion, scenarioTitle } = req.body;

    const systemInstruction = `You are a senior cultural anthropologist and sociolinguist specializing in ${language} and specifically the ${dialectRegion} dialect.
Provide intermediate language learners with an insider guide to cultural etiquette, unwritten social norms, taboo behaviors, and regional idiomatic expressions.`;

    const prompt = `Generate a master cultural & nuance briefing for ${dialectRegion} (${language}) in the context of "${scenarioTitle}".
Include:
1. 3 essential unspoken etiquette rules that textbooks never teach.
2. 5 distinctive local idioms / slang terms unique to ${dialectRegion} with literal meaning, colloquial meaning, and usage notes.
3. Register comparison table: Compare how an everyday sentiment is expressed in Slang, Casual, Polite, and Formal.
4. Social taboos and false friends (words or gestures that cause awkwardness).
5. Conversational pacing and backchanneling cues (e.g. how locals show they are listening).`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        regionTitle: { type: Type.STRING },
        culturalMindset: { type: Type.STRING },
        unspokenEtiquetteRules: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ruleTitle: { type: Type.STRING },
              explanation: { type: Type.STRING },
              practicalExample: { type: Type.STRING },
            },
            required: ['ruleTitle', 'explanation'],
          },
        },
        regionalIdioms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              idiom: { type: Type.STRING },
              literalTranslation: { type: Type.STRING },
              trueMeaning: { type: Type.STRING },
              exampleSentence: { type: Type.STRING },
              register: { type: Type.STRING },
            },
            required: ['idiom', 'literalTranslation', 'trueMeaning', 'exampleSentence'],
          },
        },
        registerSpectrum: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING, description: 'What the speaker wants to say' },
              slang: { type: Type.STRING },
              casual: { type: Type.STRING },
              polite: { type: Type.STRING },
              formal: { type: Type.STRING },
            },
            required: ['intent', 'slang', 'casual', 'polite', 'formal'],
          },
        },
        socialTaboosAndPitfalls: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              trap: { type: Type.STRING },
              consequence: { type: Type.STRING },
              safeAlternative: { type: Type.STRING },
            },
            required: ['trap', 'consequence', 'safeAlternative'],
          },
        },
        backchannelingAndPacing: {
          type: Type.OBJECT,
          properties: {
            listeningMarkers: { type: Type.ARRAY, items: { type: Type.STRING } },
            pauseTolerance: { type: Type.STRING },
            interruptionNorms: { type: Type.STRING },
          },
          required: ['listeningMarkers', 'pauseTolerance', 'interruptionNorms'],
        },
      },
      required: ['regionTitle', 'culturalMindset', 'unspokenEtiquetteRules', 'regionalIdioms', 'registerSpectrum', 'socialTaboosAndPitfalls'],
    };

    const data = await generateJson(prompt, systemInstruction, schema);
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/culture/deep-dive:', error);
    res.status(500).json({ error: error.message || 'Failed to generate cultural guide' });
  }
});

// 4. Custom Scenario Generator
app.post('/api/scenario/generate', async (req, res) => {
  try {
    const { promptTopic, language, dialectRegion } = req.body;

    const systemInstruction = `You are a curriculum designer creating realistic, nuanced conversational simulations for intermediate language learners in ${language} (${dialectRegion}).`;
    const prompt = `Create a realistic conversation scenario based on: "${promptTopic}".
The scenario should be tailored for intermediate speakers who want to master regional nuance, idioms, and etiquette in ${dialectRegion}.
Provide title, description, character name & background, the learner's objective, opening line by the character with translation and phonetics, and initial cultural nuance points.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        category: { type: Type.STRING },
        language: { type: Type.STRING },
        dialectRegion: { type: Type.STRING },
        location: { type: Type.STRING },
        characterName: { type: Type.STRING },
        characterRole: { type: Type.STRING },
        learnerRole: { type: Type.STRING },
        context: { type: Type.STRING },
        goal: { type: Type.STRING },
        recommendedRegister: { type: Type.STRING },
        openingMessage: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            translation: { type: Type.STRING },
            phonetic: { type: Type.STRING },
          },
          required: ['text', 'translation'],
        },
        initialEtiquetteNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        keyRegionalIdioms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
            required: ['term', 'meaning'],
          },
        },
      },
      required: ['title', 'category', 'characterName', 'characterRole', 'context', 'goal', 'openingMessage'],
    };

    const data = await generateJson(prompt, systemInstruction, schema);
    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/scenario/generate:', error);
    res.status(500).json({ error: error.message || 'Failed to generate custom scenario' });
  }
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cadence Language Companion listening on http://0.0.0.0:${PORT}`);
});
