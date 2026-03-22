import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import { applyDesignTokens, PRESET_TOKENS } from './theme';
import './index.css';

/* Avoid unstyled first paint before React mounts DesignTokensProvider */
applyDesignTokens(PRESET_TOKENS.light);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
