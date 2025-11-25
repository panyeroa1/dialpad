export enum CallResult {
  COMPLETED = 'completed',
  NO_ANSWER = 'no_answer',
  FAILED = 'failed',
  BUSY = 'busy'
}

export interface VoiceBehaviorFlags {
  breathy: boolean;
  coughs: boolean;
  sniffs: boolean;
  nativeSpeaker: boolean;
  naturalExpressions: boolean;
  imperfections: boolean;
  doubleWords: boolean;
  responseInSsml: boolean;
}

export interface BrokerPersona {
  id: string;
  label: string;
  description: string;
  promptProfile: {
    domain: string;
    tone: string;
    callGoals: string;
    compliance: string;
  };
}

export interface VoiceOption {
  id: string;
  label: string;
  engine: string;
  gender: string;
}

export interface DialerSettings {
  brokerPersonaId: string;
  voiceId: string;
  voiceBehavior: VoiceBehaviorFlags;
}

export interface CallLogEntry {
  id: string;
  phoneNumber: string;
  brokerPersonaId: string;
  voiceId: string;
  startedAt: string; // ISO date
  durationSeconds: number;
  result: CallResult;
  notes?: string;
}

export interface SystemPromptContext {
  persona: BrokerPersona;
  behavior: VoiceBehaviorFlags;
}