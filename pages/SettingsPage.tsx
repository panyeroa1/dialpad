import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Using HashRouter in App
import { ChevronLeft, Save } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BROKER_PERSONAS, VOICES, LANGUAGES } from '../constants';
import { Layout } from '../components/Layout';
import { DialerSettings, VoiceBehaviorFlags } from '../types';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useStore();
  
  // Local state for form
  const [formData, setFormData] = useState<DialerSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof VoiceBehaviorFlags) => {
    setFormData(prev => ({
      ...prev,
      voiceBehavior: {
        ...prev.voiceBehavior,
        [key]: !prev.voiceBehavior[key]
      }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save delay for effect
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      navigate('/');
    }, 500);
  };

  const selectedPersona = BROKER_PERSONAS.find(p => p.id === formData.brokerPersonaId);

  return (
    <Layout className="bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Call Settings</h1>
        <div className="w-8"></div> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar pb-24">
        
        {/* Persona Section */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Broker Persona</label>
          <div className="relative">
            <select
              value={formData.brokerPersonaId}
              onChange={(e) => setFormData({ ...formData, brokerPersonaId: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-xl p-4 appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700"
            >
              {BROKER_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
          {selectedPersona && (
            <p className="text-sm text-slate-400 px-1">{selectedPersona.description}</p>
          )}
        </section>

        {/* Language Section */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
          <div className="relative">
            <select
              value={formData.language || 'en-US'}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-xl p-4 appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </section>

        {/* Voice Section */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice Model</label>
          <div className="relative">
            <select
              value={formData.voiceId}
              onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
              className="w-full bg-slate-800 text-white rounded-xl p-4 appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700"
            >
              {VOICES.map(v => (
                <option key={v.id} value={v.id}>{v.label} ({v.engine})</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </section>

        {/* Toggles Section */}
        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice Behavior & Nuance</label>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700/50">
            {[
              { id: 'breathy', label: 'Breathy', desc: 'Adds subtle breathing sounds' },
              { id: 'coughs', label: 'Coughs', desc: 'Rare throat clearing' },
              { id: 'sniffs', label: 'Sniffs', desc: 'Occasional sniffle' },
              { id: 'nativeSpeaker', label: 'Native Speaker', desc: 'Use local idioms' },
              { id: 'naturalExpressions', label: 'Natural Expressions', desc: 'Use "uhm", "ah", "you know"' },
              { id: 'imperfections', label: 'Imperfections', desc: 'Slight hesitations/restarts' },
              { id: 'doubleWords', label: 'Double Words', desc: 'Repeats for emphasis' },
              { id: 'responseInSsml', label: 'Response in SSML', desc: 'Force SSML tag output' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </div>
                <button
                  onClick={() => handleToggle(item.id as keyof VoiceBehaviorFlags)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${formData.voiceBehavior[item.id as keyof VoiceBehaviorFlags] ? 'bg-blue-600' : 'bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${formData.voiceBehavior[item.id as keyof VoiceBehaviorFlags] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? 'Saving...' : <><Save size={20} /> Save Settings</>}
        </button>
      </div>
    </Layout>
  );
};