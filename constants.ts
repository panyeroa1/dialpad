import { BrokerPersona, VoiceOption, DialerSettings, VoiceBehaviorFlags, LanguageOption } from './types';

export const BROKER_PERSONAS: BrokerPersona[] = [
  {
    id: 'real_estate',
    label: 'Real Estate Broker',
    description: 'Focuses on booking property viewings and qualifying buyers.',
    promptProfile: {
      domain: 'real estate sales and property viewing calls',
      tone: 'warm, persuasive, professional',
      callGoals: 'qualify leads by asking about budget and timeline, and book property viewings',
      compliance: 'no legal/financial advice, always suggest consulting a licensed professional',
    },
  },
  {
    id: 'insurance',
    label: 'Insurance Agent',
    description: 'Friendly agent checking in on policy renewals.',
    promptProfile: {
      domain: 'insurance policy renewal and coverage review',
      tone: 'trustworthy, caring, detail-oriented',
      callGoals: 'schedule a coverage review meeting, check for life changes',
      compliance: 'do not bind coverage over the phone, state that quotes are estimates',
    },
  },
  {
    id: 'mortgage',
    label: 'Mortgage Specialist',
    description: 'Direct and efficient, focusing on rates and refinancing.',
    promptProfile: {
      domain: 'mortgage refinancing and loan pre-qualification',
      tone: 'confident, knowledgeable, efficient',
      callGoals: 'determine current interest rate, offer comparison, book consultation',
      compliance: 'include disclaimer that this is not a credit commitment',
    },
  },
  {
    id: 'recruiter',
    label: 'Tech Recruiter',
    description: 'High energy, pitching a new senior role.',
    promptProfile: {
      domain: 'senior software engineering recruitment',
      tone: 'excited, fast-paced, complimentary',
      callGoals: 'gauge interest in a new role, get availability for a screening call',
      compliance: 'do not promise specific salary figures, ranges only',
    },
  }
];

export const VOICES: VoiceOption[] = [
  { id: 'orus_homie', label: 'Orus – Friendly', engine: 'cartesia', gender: 'Male' },
  { id: 'ellie_flemish', label: 'Ellie – Professional', engine: 'eburon_tts', gender: 'Female' },
  { id: 'ayla_tr', label: 'Ayla – Soft', engine: 'cartesia', gender: 'Female' },
  { id: 'marcus_biz', label: 'Marcus – Executive', engine: 'other', gender: 'Male' },
];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'nl-NL', label: 'Dutch' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'hi-IN', label: 'Hindi' },
];

export const DEFAULT_BEHAVIOR: VoiceBehaviorFlags = {
  breathy: false,
  coughs: false,
  sniffs: false,
  nativeSpeaker: true,
  naturalExpressions: true,
  imperfections: false,
  doubleWords: false,
  responseInSsml: false,
};

export const DEFAULT_SETTINGS: DialerSettings = {
  brokerPersonaId: 'real_estate',
  voiceId: 'orus_homie',
  language: 'en-US',
  voiceBehavior: DEFAULT_BEHAVIOR,
};