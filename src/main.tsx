import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { loadVoiceManifest } from './lib/voice';
import './index.css';

void loadVoiceManifest();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
