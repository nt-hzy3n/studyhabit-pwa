import { syncQueueRepository } from '../../db/repositories/syncQueueRepository';
import { responseRepository } from '../../db/repositories/responseRepository';
import { googleSheetsApi } from '../api/googleSheetsApi';
import { networkService } from '../network/networkService';

export type SyncStatusListener = (state: {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt?: string;
  lastError?: string;
}) => void;

class SyncManager {
  private isSyncing = false;
  private listeners: Set<SyncStatusListener> = new Set();
  private lastSyncedAt?: string;
  private lastError?: string;
  private initialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Online event listener fallback: auto-sync when connection is restored
    networkService.subscribe((isOnline) => {
      if (isOnline) {
        console.log('[SyncManager] Online event detected. Triggering sequential auto-sync...');
        this.processQueue();
      }
    });

    // 2. Background Sync API registration where supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((registration: any) => {
          if (registration.sync) {
            window.addEventListener('studyhabit-trigger-bg-sync', () => {
              registration.sync.register('studyhabit-sync').catch((err: any) => {
                console.warn('[SyncManager] Background Sync registration warning:', err);
              });
            });
          }
        })
        .catch((err) => {
          console.warn('[SyncManager] SW ready registration catch:', err);
        });
    }
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    this.notifyState();
    return () => this.listeners.delete(listener);
  }

  private async notifyState() {
    const pendingCount = (await syncQueueRepository.getPending()).length;
    this.listeners.forEach((listener) => {
      try {
        listener({
          isSyncing: this.isSyncing,
          pendingCount,
          lastSyncedAt: this.lastSyncedAt,
          lastError: this.lastError,
        });
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  /**
   * Enqueues a response for synchronization and triggers processing if online
   */
  public async queueResponse(responseId: string, surveyId: string): Promise<void> {
    await syncQueueRepository.enqueue(responseId, surveyId);
    await responseRepository.updateStatus(responseId, 'PENDING_SYNC');
    await this.notifyState();

    // Trigger background sync event for SW
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studyhabit-trigger-bg-sync'));
    }

    // If currently online, attempt immediate synchronization
    if (networkService.getStatus()) {
      this.processQueue();
    }
  }

  /**
   * Sequentially processes pending items in the queue
   */
  public async processQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress, skipping duplicate call.');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    if (!networkService.getStatus()) {
      console.log('[SyncManager] Offline: keeping pending responses in local queue.');
      await this.notifyState();
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.lastError = undefined;
    await this.notifyState();

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const pendingItems = await syncQueueRepository.getPending();

      for (const item of pendingItems) {
        // Stop if network lost mid-queue
        if (!networkService.getStatus()) {
          console.log('[SyncManager] Network lost during sequential queue processing.');
          break;
        }

        const response = await responseRepository.getById(item.responseId);
        if (!response) {
          // Response was removed locally, remove stale queue item
          await syncQueueRepository.remove(item.id);
          continue;
        }

        processed++;
        await responseRepository.updateStatus(item.responseId, 'SYNCING');
        await this.notifyState();

        try {
          // POST to Google Apps Script
          const result = await googleSheetsApi.submitResponse(response);

          if (result.success) {
            // Success or Idempotent Duplicate: mark SYNCED and remove from queue
            const now = result.syncedAt || new Date().toISOString();
            await responseRepository.updateStatus(item.responseId, 'SYNCED', {
              syncedAt: now,
              lastError: '',
            });
            await syncQueueRepository.remove(item.id);
            this.lastSyncedAt = now;
            succeeded++;
          } else {
            throw new Error(result.error || 'Máy chủ từ chối tiếp nhận phiếu.');
          }
        } catch (err: any) {
          failed++;
          const errorMsg = err.message || 'Lỗi kết nối / đồng bộ Google Apps Script';
          this.lastError = errorMsg;
          console.warn(`[SyncManager] Failed to sync item ${item.id}:`, errorMsg);

          // Return to PENDING_SYNC and increment retry count so data is NEVER lost
          await responseRepository.updateStatus(item.responseId, 'PENDING_SYNC', {
            lastError: errorMsg,
            retryIncrement: true,
          });
          await syncQueueRepository.markFailed(item.id, errorMsg);
        }
      }
    } finally {
      this.isSyncing = false;
      await this.notifyState();
    }

    return { processed, succeeded, failed };
  }

  /**
   * Retries an individual response
   */
  public async retryItem(responseId: string): Promise<void> {
    const response = await responseRepository.getById(responseId);
    if (!response) return;

    await this.queueResponse(response.id, response.surveyId);
  }
}

export const syncManager = new SyncManager();
