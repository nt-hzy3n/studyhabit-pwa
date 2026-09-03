import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export type NetworkListener = (isOnline: boolean) => void;

class NetworkService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<NetworkListener> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Check status via Capacitor Network if native or available
    try {
      if (Capacitor.isPluginAvailable('Network')) {
        const status = await Network.getStatus();
        this.isOnline = status.connected;

        Network.addListener('networkStatusChange', status => {
          this.setOnline(status.connected);
        });
      }
    } catch (e) {
      console.warn('Capacitor Network plugin initialization warning:', e);
    }

    // Always attach browser window listeners as reliable baseline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
      this.isOnline = navigator.onLine;
    }
  }

  private setOnline(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.isOnline);
      } catch (err) {
        console.error('Error in network listener:', err);
      }
    });
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    // immediately call with current state
    listener(this.isOnline);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const networkService = new NetworkService();
