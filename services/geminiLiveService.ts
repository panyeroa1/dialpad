import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { DialerSettings, BrokerPersona, VoiceBehaviorFlags } from '../types';
import { BROKER_PERSONAS } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputNode: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private sessionPromise: Promise<any> | null = null;
  private stream: MediaStream | null = null;
  private isConnected = false;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private buildSystemPrompt(settings: DialerSettings): string {
    const persona = BROKER_PERSONAS.find(p => p.id === settings.brokerPersonaId) || BROKER_PERSONAS[0];
    const { promptProfile } = persona;
    const { voiceBehavior } = settings;

    let instruction = `
You are acting as a ${persona.label}.
Description: ${persona.description}
Domain: ${promptProfile.domain}
Tone: ${promptProfile.tone}
Goals: ${promptProfile.callGoals}
Compliance Rules: ${promptProfile.compliance}

You are on a phone call. Keep responses relatively short and conversational.
Do not use markdown formatting.
`;

    // Apply Voice Behavior Flags to the prompt
    if (voiceBehavior.breathy) {
      instruction += `\n- Incorporate subtle breathing indicators in your text representation where appropriate to sound breathy.`;
    }
    if (voiceBehavior.coughs) {
      instruction += `\n- Occasionally, but rarely, clear your throat or cough slightly, then apologize quickly.`;
    }
    if (voiceBehavior.sniffs) {
      instruction += `\n- Occasionally include a subtle sniff sound.`;
    }
    if (voiceBehavior.nativeSpeaker) {
      instruction += `\n- Use idioms and sentence structures typical of a native speaker in this domain.`;
    }
    if (voiceBehavior.naturalExpressions) {
      instruction += `\n- Use natural fillers like "uhm", "ah", "you know", "okay wait" to sound human.`;
    }
    if (voiceBehavior.imperfections) {
      instruction += `\n- Include slight hesitations or restarts in sentences to mimic spontaneous speech.`;
    }
    if (voiceBehavior.doubleWords) {
      instruction += `\n- Occasionally repeat a word for emphasis or hesitation, e.g., "wait, wait" or "yeah, yeah".`;
    }
    if (voiceBehavior.responseInSsml) {
      instruction += `\n- CRITICAL: Your response MUST be valid SSML. Use <prosody>, <break>, and <emphasis> tags to convey the emotions described above.`;
    }

    return instruction;
  }

  async connect(settings: DialerSettings, onDisconnect: () => void, onError: (err: any) => void) {
    if (this.isConnected) return;

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const systemInstruction = this.buildSystemPrompt(settings);
      
      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            this.isConnected = true;
            this.startAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && this.outputAudioContext && this.outputNode) {
              const audioData = base64ToUint8Array(base64Audio);
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              
              const audioBuffer = await decodeAudioData(
                audioData,
                this.outputAudioContext,
                24000,
                1
              );

              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener('ended', () => {
                this.sources.delete(source);
              });
              
              source.start(this.nextStartTime);
              this.nextStartTime += audioBuffer.duration;
              this.sources.add(source);
            }

            if (message.serverContent?.interrupted) {
              this.stopAudioOutput();
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            this.cleanup();
            onDisconnect();
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            onError(e);
            this.cleanup();
            onDisconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
          }
        }
      });
    } catch (err) {
      console.error("Failed to connect", err);
      onError(err);
      this.cleanup();
    }
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.stream) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    // Using ScriptProcessor as per guidance examples, though deprecated it's stable for this usage
    this.inputNode = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.inputNode.onaudioprocess = (e) => {
      if (!this.isConnected) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(this.inputNode);
    this.inputNode.connect(this.inputAudioContext.destination);
  }

  private stopAudioOutput() {
    for (const source of this.sources) {
      source.stop();
    }
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    if (this.sessionPromise) {
        // There is no explicit .close() on the promise wrapper in SDK reference provided, 
        // usually closing the client or triggering close from server side. 
        // But assuming we can just stop sending and close context.
        // If the real SDK has a close method on the session object:
        this.sessionPromise.then((session: any) => {
            if(session.close) session.close();
        }).catch(() => {});
    }
    this.cleanup();
  }

  private cleanup() {
    this.isConnected = false;
    this.stopAudioOutput();
    
    if (this.inputNode) {
      this.inputNode.disconnect();
      this.inputNode = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
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