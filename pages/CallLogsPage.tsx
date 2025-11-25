import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Layout } from '../components/Layout';
import { BROKER_PERSONAS, VOICES } from '../constants';
import { CallResult } from '../types';

export const CallLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getCallLogs } = useStore();
  const logs = getCallLogs();

  const getPersonaLabel = (id: string) => BROKER_PERSONAS.find(p => p.id === id)?.label || id;
  const getVoiceLabel = (id: string) => VOICES.find(v => v.id === id)?.label || id;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
    });
  };

  const getStatusColor = (result: CallResult) => {
    switch(result) {
      case CallResult.COMPLETED: return 'text-green-400 bg-green-400/10';
      case CallResult.FAILED: return 'text-red-400 bg-red-400/10';
      case CallResult.BUSY: return 'text-orange-400 bg-orange-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <Layout className="bg-slate-900">
      <header className="flex items-center justify-between p-4 border-b border-slate-800">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Recent Calls</h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Phone size={48} className="mb-4 opacity-50" />
            <p>No calls recorded yet.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex justify-between items-center">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-lg font-bold text-white tracking-wide">{log.phoneNumber}</h3>
                <div className="text-xs text-slate-400 mt-1 flex flex-col gap-0.5">
                   <span className="truncate">{getPersonaLabel(log.brokerPersonaId)}</span>
                   <span className="truncate text-slate-500">{getVoiceLabel(log.voiceId)}</span>
                   <span className="mt-1">{formatDate(log.startedAt)}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${getStatusColor(log.result)}`}>
                    {log.result}
                 </span>
                 <div className="flex items-center text-slate-400 text-sm">
                    <Clock size={12} className="mr-1" />
                    {formatDuration(log.durationSeconds)}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};