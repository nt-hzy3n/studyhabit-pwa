import { getDB } from '../database';
import type { SyncQueueItem } from '../../types/survey';
import { generateUUID } from '../../utils/uuid';

export const syncQueueRepository = {
  async enqueue(responseId: string, surveyId: string): Promise<SyncQueueItem> {
    const db = await getDB();
    const existing = await this.getByResponseId(responseId);
    if (existing) {
      existing.status = 'PENDING';
      existing.retryCount = 0;
      existing.timestamp = new Date().toISOString();
      await db.put('syncQueue', existing);
      return existing;
    }

    const item: SyncQueueItem = {
      id: generateUUID(),
      responseId,
      surveyId,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING',
    };
    await db.put('syncQueue', item);
    return item;
  },

  async getAll(): Promise<SyncQueueItem[]> {
    const db = await getDB();
    const items = await db.getAll('syncQueue');
    return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async getPending(): Promise<SyncQueueItem[]> {
    const all = await this.getAll();
    return all.filter(item => item.status === 'PENDING');
  },

  async getByResponseId(responseId: string): Promise<SyncQueueItem | undefined> {
    const db = await getDB();
    const index = db.transaction('syncQueue').store.index('by-response');
    return index.get(responseId);
  },

  async markFailed(id: string, errorMessage: string): Promise<void> {
    const db = await getDB();
    const item = await db.get('syncQueue', id);
    if (item) {
      item.status = 'FAILED';
      item.retryCount += 1;
      item.lastAttempt = new Date().toISOString();
      item.errorMessage = errorMessage;
      await db.put('syncQueue', item);
    }
  },

  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('syncQueue', id);
  },

  async removeByResponseId(responseId: string): Promise<void> {
    const db = await getDB();
    const index = db.transaction('syncQueue', 'readwrite').store.index('by-response');
    let cursor = await index.openCursor(responseId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  },

  async getCount(): Promise<number> {
    const db = await getDB();
    return db.count('syncQueue');
  }
};
