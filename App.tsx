import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { DialerPage } from './pages/DialerPage';
import { SettingsPage } from './pages/SettingsPage';
import { CallLogsPage } from './pages/CallLogsPage';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<DialerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/logs" element={<CallLogsPage />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;