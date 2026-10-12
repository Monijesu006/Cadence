import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import {
  Scenario,
  DialogueMessage,
  RegisterLevel,
  UserTurnFeedback,
  CulturalNuance,
  SuggestedOption,
  SpeechAnalysisResult,
} from '../types';
import { speechService, AudioCaptureMetrics } from '../utils/speech';

interface DialogueChamberProps {
  scenario: Scenario;
  onBack: () => void;
  onOpenClinic: (userText: string, scenario: Scenario, targetRegister: RegisterLevel) => void;
}

export const DialogueChamber: React.FC<DialogueChamberProps> = ({
  scenario,
  onBack,
  onOpenClinic,
}) => {
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedRegister, setSelectedRegister] = useState<RegisterLevel>(scenario.recommendedRegister);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [showPhonetics, setShowPhonetics] = useState<Record<string, boolean>>({});
  const [activeNuance, setActiveNuance] = useState<CulturalNuance | null>(null);
  const [latestFeedback, setLatestFeedback] = useState<UserTurnFeedback | null>(null);
  const [suggestedOptions, setSuggestedOptions] = useState<SuggestedOption[]>([]);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [capturedMetrics, setCapturedMetrics] = useState<AudioCaptureMetrics | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with the scenario opening message
  useEffect(() => {
    const openingMsg: DialogueMessage = {
      id: 'msg-0',
      role: 'assistant',
      text: scenario.openingMessage.text,
      translation: scenario.openingMessage.translation,
      phonetics: scenario.openingMessage.phonetics,
      cadenceNotes: scenario.openingMessage.cadenceNotes,
      timestamp: Date.now(),
      nuance: {
        socialEtiquette: scenario.initialEtiquetteNotes[0] || 'Observe local greeting formulas before initiating business.',
        registerLevel: scenario.recommendedRegister,
        bodyLanguageOrNonVerbal: 'Maintain open, natural posture; avoid rigid formal stance.',
        regionalSlangNotes: scenario.keyRegionalIdioms.map((k) => ({
          term: k.term,
          literalMeaning: k.literal || 'Literal phrase',
          actualMeaning: k.meaning,
          region: scenario.dialectRegion,
        })),
      },
    };

    setMessages([openingMsg]);
    setActiveNuance(openingMsg.nuance || null);
    setShowTranslations({ 'msg-0': false });
    setShowPhonetics({ 'msg-0': true });
  }, [scenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Audio Canvas visualizer animation when recording
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas || !isRecording) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const analyser = speechService.getAnalyser();

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#f59e0b';
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else {
        // Fallback pulsing wave if mic stream analyser is restricted
        const time = Date.now() / 200;
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 20; i++) {
          const height = Math.abs(Math.sin(time + i)) * (canvas.height * 0.8) + 4;
          ctx.fillRect(i * 12, (canvas.height - height) / 2, 8, height);
        }
      }

      animationFrameId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording]);

  const handleToggleAudio = (msgId: string, text: string) => {
    if (isSpeakingId === msgId) {
      speechService.stopSpeaking();
      setIsSpeakingId(null);
    } else {
      setIsSpeakingId(msgId);
      speechService.speak(
        text,
        scenario.languageCode,
        () => setIsSpeakingId(null),
        0.92
      );
    }
  };

  const handleToggleTranslation = (msgId: string) => {
    setShowTranslations((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleTogglePhonetics = (msgId: string) => {
    setShowPhonetics((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const startVoiceRecording = async () => {
    setIsRecording(true);
    await speechService.startListening(
      scenario.languageCode,
      (transcript, isFinal) => {
        setInputText(transcript);
      },
      (error) => {
        console.warn('Microphone status:', error);
      },
      (vol) => {
        setAudioVolume(vol);
      }
    );
  };

  const stopVoiceRecording = () => {
    const metrics = speechService.stopListening();
    setCapturedMetrics(metrics);
    setIsRecording(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    if (isRecording) {
      stopVoiceRecording();
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: DialogueMessage = {
      id: userMsgId,
      role: 'user',
      text: messageContent,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/dialogue/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: scenario.title,
          scenarioContext: scenario.context,
          characterName: scenario.characterName,
          characterRole: scenario.characterRole,
          language: scenario.language,
          dialectRegion: scenario.dialectRegion,
          targetRegister: selectedRegister,
          dialogueHistory: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
            translation: m.translation,
          })),
          userMessage: messageContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMsgId = `asst-${Date.now()}`;
      const assistantMsg: DialogueMessage = {
        id: assistantMsgId,
        role: 'assistant',
        text: data.characterReply,
        translation: data.characterReplyTranslation,
        phonetics: data.characterReplyPhonetics,
        cadenceNotes: data.cadenceAndRhythmNotes,
        timestamp: Date.now(),
        nuance: data.culturalNuance,
        feedback: data.userTurnFeedback,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActiveNuance(data.culturalNuance);
      setLatestFeedback(data.userTurnFeedback);
      setSuggestedOptions(data.suggestedUserOptions || []);
      setShowTranslations((prev) => ({ ...prev, [assistantMsgId]: false }));
      setShowPhonetics((prev) => ({ ...prev, [assistantMsgId]: true }));

      // Automatically speak the native response
      speechService.speak(data.characterReply, scenario.languageCode, () => setIsSpeakingId(null), 0.95);
      setIsSpeakingId(assistantMsgId);
    } catch (err: any) {
      console.error('Failed to communicate with dialogue agent:', err);
      // Fallback message
      const fallbackId = `err-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: fallbackId,
          role: 'assistant',
          text: `[Connecting with ${scenario.characterName}] - Let's continue.`,
          translation: 'Could you rephrase that in local cadence?',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
      {/* Top Chamber Bar */}
      <div className="bg-white px-5 py-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            title="Return to scenarios"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-semibold text-stone-900">{scenario.title}</span>
              <span aria-hidden="true">·</span>
              <span>{scenario.dialectRegion}</span>
            </div>
            <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
              <span>Talking with <strong className="text-stone-700">{scenario.characterName}</strong> ({scenario.characterRole})</span>
            </div>
          </div>
        </div>

        {/* Register Control Bar */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
          <span className="text-[11px] font-mono text-stone-500 px-2 uppercase tracking-wide">Register:</span>
          {(['slang', 'casual', 'neutral', 'polite', 'formal'] as RegisterLevel[]).map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegister(reg)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                selectedRegister === reg
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Zone Sandbox Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left/Center Zone: Interactive Dialogue Stream (7-cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white overflow-hidden border-r border-stone-200">
          {/* Scrollable Conversation Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Scenario Goal Reminder Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-stone-700 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-950 block mb-0.5">Your Conversational Goal:</span>
                <p className="text-stone-600">{scenario.goal}</p>
              </div>
            </div>

            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in-50 duration-200`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-stone-400">
                    <span>{isUser ? 'You (Learner)' : scenario.characterName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-stone-900 text-stone-100 rounded-br-xs shadow-xs'
                        : 'bg-stone-50 border border-stone-200/90 text-stone-900 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {/* Spoken Text */}
                    <div className="text-base font-normal tracking-wide">
                      {msg.text}
                    </div>

                    {/* Phonetic Pronunciation Guide */}
                    {!isUser && msg.phonetics && showPhonetics[msg.id] && (
                      <div className="mt-2 pt-2 border-t border-stone-200 text-xs font-mono text-amber-900/90 bg-amber-50/60 p-2 rounded-md">
                        <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">Phonetic & Rhythm Guide:</span>
                        {msg.phonetics}
                      </div>
                    )}

                    {/* Cadence Notes */}
                    {!isUser && msg.cadenceNotes && msg.cadenceNotes.length > 0 && showPhonetics[msg.id] && (
                      <div className="mt-2 space-y-1 text-xs text-stone-600">
                        {msg.cadenceNotes.map((note, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <span className="text-amber-600 font-bold">›</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Translation */}
                    {!isUser && msg.translation && showTranslations[msg.id] && (
                      <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-stone-600 italic">
                        "{msg.translation}"
                      </div>
                    )}

                    {/* Action Bar for Assistant Message */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-stone-200/70 flex items-center gap-3 text-xs text-stone-500">
                        <button
                          onClick={() => handleToggleAudio(msg.id, msg.text)}
                          className="flex items-center gap-1 hover:text-stone-900 transition-colors"
                          title="Listen to native cadence"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isSpeakingId === msg.id ? 'text-amber-600 animate-pulse' : ''}`} />
                          <span>{isSpeakingId === msg.id ? 'Playing...' : 'Listen'}</span>
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          onClick={() => handleToggleTranslation(msg.id)}
                          className="flex items-center gap-1 hover:text-stone-900 transition-colors"
                        >
                          {showTranslations[msg.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showTranslations[msg.id] ? 'Hide English' : 'Show English'}</span>
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          onClick={() => handleTogglePhonetics(msg.id)}
                          className="flex items-center gap-1 hover:text-stone-900 transition-colors"
                        >
                          <span>{showPhonetics[msg.id] ? 'Hide Phonetics' : 'Phonetics'}</span>
                        </button>
                      </div>
                    )}

                    {/* Learner Speech Clinic Button on User Message */}
                    {isUser && (
                      <div className="mt-2 pt-2 border-t border-stone-700/80 flex items-center justify-between text-xs text-stone-400">
                        <button
                          onClick={() => onOpenClinic(msg.text, scenario, selectedRegister)}
                          className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Run Speech & Tone Clinic</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500 max-w-xs animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>{scenario.characterName} is formulating natural response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Pick Suggested Registers Strip (Intermediate Learning Tool) */}
          {suggestedOptions.length > 0 && (
            <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-200 shrink-0">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-2">
                Suggested Turn Options by Register:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {suggestedOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(opt.phrase)}
                    className="text-left p-2.5 bg-white border border-stone-200 rounded-lg hover:border-amber-400 hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold">
                        {opt.register}
                      </span>
                      <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-medium text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                      {opt.phrase}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {opt.translation}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Speech & Text Input Dock */}
          <div className="p-4 bg-white border-t border-stone-200 shrink-0">
            {isRecording && (
              <div className="mb-3 p-3 bg-amber-50/90 border border-amber-300 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-semibold text-stone-900 font-mono">Listening in {scenario.dialectRegion}...</span>
                </div>
                <canvas ref={canvasRef} width={180} height={30} className="rounded-md" />
                <button
                  onClick={stopVoiceRecording}
                  className="px-3 py-1 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Done Speaking
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`p-3 rounded-xl transition-all shadow-xs ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                }`}
                title={isRecording ? 'Stop recording' : 'Speak your response (Mic)'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Respond in ${scenario.language} (${selectedRegister} register)...`}
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                disabled={isLoading}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-stone-900 text-white rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-stone-900 transition-all shadow-xs"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Zone: Side-by-Side Culture & Nuance Live Deck (4-cols) */}
        <div className="lg:col-span-4 bg-stone-50 overflow-y-auto p-5 space-y-5 border-l border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-500 mb-1">
              <span>Live Social Context</span>
              <span aria-hidden="true">·</span>
              <span>{scenario.dialectRegion}</span>
            </div>
            <h2 className="text-lg font-bold font-display text-stone-900">
              Culture & Nuance Radar
            </h2>
          </div>

          {/* Social Etiquette & Body Language */}
          {activeNuance && (
            <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Unwritten Etiquette for This Turn</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeNuance.socialEtiquette}
              </p>

              {activeNuance.bodyLanguageOrNonVerbal && (
                <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
                  <span className="font-semibold text-stone-700 block mb-0.5">Physical / Non-Verbal Cue:</span>
                  <span>{activeNuance.bodyLanguageOrNonVerbal}</span>
                </div>
              )}
            </div>
          )}

          {/* User Feedback & Native Upgrade Card */}
          {latestFeedback && (
            <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Turn Naturalness Feedback</span>
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                  {latestFeedback.fluencyScore}/100
                </span>
              </div>

              <div className="text-xs text-stone-600">
                <span className="font-medium text-stone-800">Register Verdict:</span> {latestFeedback.registerVerdict}
              </div>

              {latestFeedback.intermediatePitfall && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Intermediate Pitfall:</span>
                  {latestFeedback.intermediatePitfall}
                </div>
              )}

              {/* Native Upgrade Alternative */}
              {latestFeedback.nativeAlternative && (
                <div className="pt-3 border-t border-stone-100">
                  <span className="text-[11px] font-mono uppercase text-amber-800 font-bold block mb-1">
                    Native Local Upgrade:
                  </span>
                  <div className="p-2.5 bg-stone-900 text-stone-100 rounded-lg text-xs font-medium">
                    "{latestFeedback.nativeAlternative.phrase}"
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    {latestFeedback.nativeAlternative.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Regional Slang & Idiom Highlights */}
          {activeNuance?.regionalSlangNotes && activeNuance.regionalSlangNotes.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Regional Slang Breakdown</span>
              </div>

              <div className="space-y-2.5">
                {activeNuance.regionalSlangNotes.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 italic font-display">"{item.term}"</span>
                      {item.region && <span className="text-[10px] text-stone-400 font-mono">{item.region}</span>}
                    </div>
                    <div className="text-stone-500 text-[11px] mt-0.5">
                      <span className="text-stone-400">Literal:</span> {item.literalMeaning}
                    </div>
                    <div className="text-amber-900 font-medium text-[11px] mt-0.5">
                      <span className="text-stone-400">Means:</span> {item.actualMeaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deep Speech Clinic Quick Callout */}
          <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-amber-300 font-semibold block">
              Speech Diagnostic Lab
            </span>
            <p className="text-xs text-stone-300 leading-relaxed">
              Want deep phonetic IPA tips, pause-frequency checks, and syllable stress breakdown on your speech?
            </p>
            <button
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                onOpenClinic(lastUserMsg?.text || scenario.openingMessage.text, scenario, selectedRegister);
              }}
              className="mt-2 w-full py-2 px-3 bg-amber-500 text-stone-950 font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors"
            >
              Open Full Speech Clinic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
