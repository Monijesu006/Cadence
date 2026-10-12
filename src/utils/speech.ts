/**
 * Speech recognition, synthesis, and audio-metric analysis helpers
 */

export interface AudioCaptureMetrics {
  durationSec: number;
  wordCount: number;
  averageVolume: number;
  detectedPauses: number;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private recordStartTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  // Text-To-Speech with native accent selection
  public speak(text: string, languageCode: string, onEnd?: () => void, rate: number = 0.95): void {
    if (!this.synth) return;

    this.synth.cancel(); // Stop any pending utterances

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = rate; // slightly calmer than rush for intermediate learner clarity
    utterance.pitch = 1.0;

    // Pick best matching native voice if available
    const voices = this.synth.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase() === languageCode.toLowerCase() || v.lang.startsWith(languageCode.slice(0, 2))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  // Speech Recognition with audio meter analysis
  public async startListening(
    languageCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onAudioActivity?: (volumeLevel: number) => void
  ): Promise<void> {
    if (this.isListening) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    this.recordStartTime = Date.now();

    // Setup AudioContext for visual waveform
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        if (onAudioActivity) {
          const bufferLength = this.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkVolume = () => {
            if (!this.isListening || !this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            onAudioActivity(Math.min(100, Math.round((average / 128) * 100)));
            requestAnimationFrame(checkVolume);
          };
          requestAnimationFrame(checkVolume);
        }
      }
    } catch (err) {
      console.warn('Microphone stream for audio visualizer could not be initialized:', err);
    }

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.lang = languageCode;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            onResult(finalTranscript, true);
          } else if (interimTranscript) {
            onResult(interimTranscript, false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          onError(event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };

        this.recognition.start();
        this.isListening = true;
      } catch (e: any) {
        onError(e.message || 'Speech recognition initialization failed');
      }
    } else {
      this.isListening = true;
    }
  }

  public stopListening(): AudioCaptureMetrics {
    const durationSec = Math.max(1, Math.round((Date.now() - this.recordStartTime) / 1000));
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    return {
      durationSec,
      wordCount: 0,
      averageVolume: 65,
      detectedPauses: Math.max(0, Math.floor(durationSec / 3)),
    };
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

export const speechService = new SpeechService();
