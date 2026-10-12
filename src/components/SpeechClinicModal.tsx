import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play
} from 'lucide-react';
import { Scenario, RegisterLevel, SpeechAnalysisResult } from '../types';
import { speechService, AudioCaptureMetrics } from '../utils/speech';

interface SpeechClinicModalProps {
  initialText: string;
  scenario: Scenario;
  targetRegister: RegisterLevel;
  onClose: () => void;
}

export const SpeechClinicModal: React.FC<SpeechClinicModalProps> = ({
  initialText,
  scenario,
  targetRegister,
  onClose,
}) => {
  const [spokenText, setSpokenText] = useState(initialText);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-run analysis on open
  useEffect(() => {
    if (initialText) {
      runAnalysis(initialText);
    }
  }, [initialText]);

  // Waveform canvas rendering
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas || !isRecording) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const analyser = speechService.getAnalyser();

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#f59e0b';
        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else {
        const time = Date.now() / 150;
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 25; i++) {
          const height = Math.abs(Math.sin(time + i)) * (canvas.height * 0.7) + 4;
          ctx.fillRect(i * 10, (canvas.height - height) / 2, 6, height);
        }
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isRecording]);

  const runAnalysis = async (textToAnalyze: string, metrics?: AudioCaptureMetrics) => {
    if (!textToAnalyze.trim()) return;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/speech/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: scenario.language,
          dialectRegion: scenario.dialectRegion,
          targetRegister,
          scenarioTitle: scenario.title,
          userSpokenText: textToAnalyze,
          audioMetrics: metrics || {
            durationSec: 3,
            detectedPauses: 1,
          },
        }),
      });

      if (!res.ok) throw new Error('Analysis request failed');
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error('Error analyzing speech:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
    await speechService.startListening(
      scenario.languageCode,
      (transcript, isFinal) => {
        setSpokenText(transcript);
        if (isFinal) {
          // keep transcript updated
        }
      },
      (err) => console.warn(err)
    );
  };

  const handleStopRecording = () => {
    const metrics = speechService.stopListening();
    setIsRecording(false);
    runAnalysis(spokenText, metrics);
  };

  const handlePlayReference = (text: string) => {
    setIsPlayingAudio(true);
    speechService.speak(text, scenario.languageCode, () => setIsPlayingAudio(false), 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-500">
              <span>Speech & Tone Clinic</span>
              <span aria-hidden="true">·</span>
              <span>{scenario.language} ({scenario.dialectRegion})</span>
            </div>
            <h2 className="text-xl font-bold font-display text-stone-900 mt-0.5">
              Acoustic Cadence & Register Analysis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Spoken Phrase Input / Voice Studio */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 font-mono uppercase">
                Practice Phrase:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayReference(spokenText)}
                  className="flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-medium"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-amber-600' : ''}`} />
                  <span>{isPlayingAudio ? 'Speaking...' : 'Listen to Native Cadence'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              rows={2}
              className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter phrase to analyze..."
            />

            {/* Mic recording controls */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop & Analyze' : 'Record with Microphone'}</span>
                </button>

                {isRecording && (
                  <canvas ref={canvasRef} width={160} height={26} className="rounded bg-stone-100" />
                )}
              </div>

              <button
                onClick={() => runAnalysis(spokenText)}
                disabled={analyzing || isRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-stone-950 rounded-lg text-xs font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{analyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analyzing ? (
            <div className="p-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
              <p className="text-sm font-medium text-stone-700">Evaluating phonetic phonemes, rhythm stress, and regional register...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-5 animate-in fade-in-50">
              {/* Score & Verdict Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">Fluency Score</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-stone-900">{analysisResult.overallScore}</span>
                    <span className="text-xs text-stone-400">/ 100</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">Cadence & Pacing</span>
                  <span className="text-sm font-semibold text-stone-900 block mt-1">
                    {analysisResult.cadenceRating}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">Tone & Register</span>
                  <span className="text-sm font-semibold text-stone-900 block mt-1">
                    {analysisResult.toneRegisterAssessment}
                  </span>
                </div>
              </div>

              {/* Intonation & Rhythm Guidance */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-950 font-mono uppercase">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>Intonation & Rhythm Contour</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {analysisResult.intonationSummary}
                </p>
                {analysisResult.nativeAudioCadenceTip && (
                  <p className="text-xs text-amber-900 italic pt-1 border-t border-amber-200/50">
                    Cadence Tip: {analysisResult.nativeAudioCadenceTip}
                  </p>
                )}
              </div>

              {/* Phonetic Breakdown Table */}
              {analysisResult.phoneticBreakdown && analysisResult.phoneticBreakdown.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold font-display text-stone-900 mb-2">
                    Phonetic Trouble Spots & Syllable Stress
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.phoneticBreakdown.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white border border-stone-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 font-mono text-sm">"{item.word}"</span>
                          {item.phoneticGuide && (
                            <span className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                              {item.phoneticGuide}
                            </span>
                          )}
                        </div>
                        {item.commonPitfall && (
                          <p className="text-stone-500 text-[11px]">
                            <strong className="text-stone-700">Intermediate Trap:</strong> {item.commonPitfall}
                          </p>
                        )}
                        <p className="text-stone-700 font-medium text-xs">
                          <strong className="text-amber-800">Coach Tip:</strong> {item.tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regional Accent Shifts */}
              {analysisResult.regionalAccentMarkers && analysisResult.regionalAccentMarkers.length > 0 && (
                <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2">
                  <span className="text-[11px] font-mono uppercase text-amber-300 font-bold block">
                    {scenario.dialectRegion} Dialect Shifts
                  </span>
                  <ul className="space-y-1 text-xs text-stone-300">
                    {analysisResult.regionalAccentMarkers.map((shift, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">›</span>
                        <span>{shift}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved Native Version */}
              {analysisResult.improvedNativeVersion && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block mb-1">
                      Recommended Native Cadence Phrasing
                    </span>
                    <p className="text-sm font-semibold text-emerald-950 font-display">
                      "{analysisResult.improvedNativeVersion}"
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlayReference(analysisResult.improvedNativeVersion || '')}
                    className="p-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shrink-0"
                    title="Play native phrasing"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close Clinic
          </button>
        </div>
      </div>
    </div>
  );
};
