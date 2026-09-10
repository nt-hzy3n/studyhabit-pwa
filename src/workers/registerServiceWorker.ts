import { Capacitor } from '@capacitor/core';
import { syncManager } from '../services/sync/SyncManager';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (Capacitor.isNativePlatform()) {
      // On native Android/iOS, assets are loaded directly from local APK assets.
      // Unregister any stale service workers to ensure fresh code execution.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW Registration] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[SW Registration] Service Worker registration failed:', error);
        });

      // Listen for messages from SW (e.g. Background Sync triggers)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'TRIGGER_SYNC') {
          console.log('[SW Message] Received TRIGGER_SYNC from Service Worker');
          syncManager.processQueue();
        }
      });
    });
  }
}
