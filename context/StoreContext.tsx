import React, { createContext, useContext, useState, useEffect } from 'react';
import { DialerSettings, CallLogEntry, CallResult } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface StoreContextType {
  settings: DialerSettings;
  updateSettings: (newSettings: DialerSettings) => void;
  callLogs: CallLogEntry[];
  addCallLog: (entry: CallLogEntry) => void;
  getCallLogs: () => CallLogEntry[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage
  const [settings, setSettings] = useState<DialerSettings>(() => {
    const saved = localStorage.getItem('dialer_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [callLogs, setCallLogs] = useState<CallLogEntry[]>(() => {
    const saved = localStorage.getItem('dialer_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const updateSettings = (newSettings: DialerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dialer_settings', JSON.stringify(newSettings));
  };

  const addCallLog = (entry: CallLogEntry) => {
    setCallLogs(prev => {
      const newLogs = [entry, ...prev];
      localStorage.setItem('dialer_logs', JSON.stringify(newLogs));
      return newLogs;
    });
  };

  const getCallLogs = () => callLogs;

  return (
    <StoreContext.Provider value={{ settings, updateSettings, callLogs, addCallLog, getCallLogs }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};