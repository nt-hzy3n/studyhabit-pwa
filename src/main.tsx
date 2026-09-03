import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { initializeDatabase } from './db/database';
import { registerServiceWorker } from './workers/registerServiceWorker';

// 1. Initialize IndexedDB database with default VKU seed data
initializeDatabase().catch((err) => {
  console.error('[DB] Failed to initialize field-survey-db:', err);
});

// 2. Register Service Worker for Cache-First App Shell & Offline support
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
