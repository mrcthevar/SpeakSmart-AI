import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { createPCM16Blob, decodeAudioData } from "../utils";

const API_KEY = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Content Generation (Assessment, Feedback) ---

export const generateAssessmentFeedback = async (
  transcript: string, 
  context: string
): Promise<any> => {
  if (!API_KEY) throw new Error("API Key missing");

  const prompt = `
    Analyze the following transcript from a communication exercise.
    Context: ${context}
    Transcript: "${transcript}"
    
    Provide a JSON response with:
    - overallScore (0-100)
    - metrics: Array of objects { category: string, score: number, details: string } (Categories: Pace, Clarity, Grammar, Vocabulary)
    - improvementTips: Array of strings (3 specific actionable tips)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                score: { type: Type.INTEGER },
                details: { type: Type.STRING },
              }
            }
          },
          improvementTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// --- Live API (Real-time Coaching) ---

export interface LiveSessionCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  onAudioData: (audioBuffer: AudioBuffer) => void;
  onInterrupted: () => void;
  onTurnComplete: () => void;
}

export class LiveCoachSession {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private outputGain: GainNode | null = null;
  private callbacks: LiveSessionCallbacks;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(systemInstruction: string, voiceName: string = 'Kore') {
    if (!API_KEY) {
      this.callbacks.onError("API Key is missing.");
      return;
    }

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputGain = this.outputAudioContext.createGain();
      this.outputGain.connect(this.outputAudioContext.destination);

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          systemInstruction: systemInstruction,
        },
        callbacks: {
          onopen: () => {
            this.callbacks.onConnect();
            this.startAudioStreaming();
          },
          onmessage: this.handleMessage.bind(this),
          onclose: () => {
            this.callbacks.onDisconnect();
            this.cleanup();
          },
          onerror: (e) => {
            this.callbacks.onError("Connection error occurred.");
            console.error(e);
            this.cleanup();
          },
        },
      });

    } catch (err) {
      this.callbacks.onError(err instanceof Error ? err.message : "Failed to connect microphone");
    }
  }

  private startAudioStreaming() {
    if (!this.inputAudioContext || !this.mediaStream || !this.sessionPromise) return;

    this.source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const blob = createPCM16Blob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: blob });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    if (serverContent?.interrupted) {
      this.callbacks.onInterrupted();
      this.stopCurrentAudio();
    }

    if (serverContent?.turnComplete) {
        this.callbacks.onTurnComplete();
    }

    const audioData = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputAudioContext) {
      const audioBuffer = await decodeAudioData(
        base64ToUint8Array(audioData),
        this.outputAudioContext,
        24000,
        1
      );
      
      this.playAudio(audioBuffer);
      this.callbacks.onAudioData(audioBuffer);
    }
  }

  private playAudio(buffer: AudioBuffer) {
    if (!this.outputAudioContext || !this.outputGain) return;

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputGain);
    
    // Schedule playback
    const currentTime = this.outputAudioContext.currentTime;
    if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
    }
    
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  private stopCurrentAudio() {
    this.sources.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  // Use base64ToUint8Array from utils, duplicate helper removed here as we import it.
  
  disconnect() {
    if (this.sessionPromise) {
        this.sessionPromise.then(s => s.close()).catch(() => {});
    }
    this.cleanup();
  }

  private cleanup() {
    this.stopCurrentAudio();
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}