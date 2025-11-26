import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, History, Mic, PhoneOff, Signal } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DialPad } from '../components/DialPad';
import { useStore } from '../context/StoreContext';
import { GeminiLiveService } from '../services/geminiLiveService';
import { CallLogEntry, CallResult } from '../types';
import { BROKER_PERSONAS } from '../constants';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid lib, use simple random

const generateId = () => Math.random().toString(36).substring(2, 15);

enum DialerState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ENDING = 'ending'
}

export const DialerPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, addCallLog } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dialerState, setDialerState] = useState<DialerState>(DialerState.IDLE);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const geminiServiceRef = useRef<GeminiLiveService | null>(null);

  // Initialize Service
  useEffect(() => {
    geminiServiceRef.current = new GeminiLiveService();
    return () => {
      geminiServiceRef.current?.disconnect();
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (dialerState === DialerState.ACTIVE) {
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [dialerState]);

  const handleDigit = (digit: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleStartCall = async () => {
    if (!phoneNumber) return;
    
    setErrorMsg(null);
    setDialerState(DialerState.CONNECTING);
    setCallDuration(0);

    try {
      if (!geminiServiceRef.current) return;

      await geminiServiceRef.current.connect(
        settings,
        () => handleEndCall(CallResult.FAILED), // On remote disconnect
        (err) => {
            console.error(err);
            setErrorMsg("Connection Failed");
            handleEndCall(CallResult.FAILED);
        }
      );

      setDialerState(DialerState.ACTIVE);
    } catch (e) {
      setErrorMsg("Failed to start call");
      setDialerState(DialerState.IDLE);
    }
  };

  const handleEndCall = (resultOverride?: CallResult) => {
    if (dialerState === DialerState.IDLE) return;
    
    // Disconnect Gemini
    geminiServiceRef.current?.disconnect();

    const result = resultOverride || CallResult.COMPLETED;
    
    // Log Call
    const entry: CallLogEntry = {
      id: generateId(),
      phoneNumber: phoneNumber,
      brokerPersonaId: settings.brokerPersonaId,
      voiceId: settings.voiceId,
      startedAt: new Date().toISOString(),
      durationSeconds: callDuration,
      result: result
    };
    
    addCallLog(entry);
    
    setDialerState(DialerState.ENDING);
    setTimeout(() => {
      setDialerState(DialerState.IDLE);
      setCallDuration(0);
    }, 1000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentPersona = BROKER_PERSONAS.find(p => p.id === settings.brokerPersonaId);

  // -- Render: Active Call --
  if (dialerState !== DialerState.IDLE) {
    return (
      <Layout className="bg-slate-900 flex flex-col items-center justify-between py-12">
        <div className="flex flex-col items-center space-y-8 w-full px-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center relative overflow-hidden ring-4 ring-slate-800 shadow-2xl">
               {/* Animated Pulse for "Voice" */}
               {dialerState === DialerState.ACTIVE && (
                 <div className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-full"></div>
               )}
               <span className="text-4xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">{phoneNumber}</h2>
            <p className="text-blue-400 font-medium">
               {dialerState === DialerState.CONNECTING ? 'Connecting...' : 
                dialerState === DialerState.ENDING ? 'Call Ended' :
                formatTime(callDuration)}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 w-full max-w-xs text-center border border-slate-700">
             <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Active Persona</p>
             <p className="text-white font-semibold">{currentPersona?.label}</p>
          </div>
          
          {errorMsg && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
          )}
        </div>

        <div className="w-full max-w-xs px-6 pb-8">
           <button
             onClick={() => handleEndCall(CallResult.COMPLETED)}
             className="w-full h-20 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-900/50 transition-all transform active:scale-95"
           >
             <PhoneOff size={32} />
           </button>
           <p className="text-center text-slate-500 mt-4 text-sm">Tap to end call</p>
        </div>
      </Layout>
    );
  }

  // -- Render: Dialer (Idle) --
  return (
    <Layout className="bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 px-6 border-b border-slate-800">
        <button onClick={() => navigate('/logs')} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <History size={24} />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-sm font-bold tracking-widest text-blue-500">BROKER.AI</span>
             <span className="text-[10px] text-slate-500">{currentPersona?.label}</span>
        </div>
        <button onClick={() => navigate('/settings')} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Settings size={24} />
        </button>
      </header>

      {/* Number Display */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 space-y-2">
        <div className="h-24 flex items-center justify-center w-full overflow-hidden">
          <span className={`text-5xl font-light tracking-tight text-white transition-all ${!phoneNumber ? 'opacity-30 text-4xl' : ''}`}>
            {phoneNumber || 'Enter Number'}
          </span>
        </div>
        {/* Simple visualizer decoration */}
        <div className="h-8 flex items-end gap-1 opacity-20">
             {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                 <div key={i} className="w-1 bg-blue-400 rounded-full" style={{ height: `${h * 4}px`}}></div>
             ))}
        </div>
      </div>

      {/* Keypad */}
      <DialPad
        onDigitPress={handleDigit}
        onDelete={handleDelete}
        onCall={handleStartCall}
        disabled={false}
      />
    </Layout>
  );
};