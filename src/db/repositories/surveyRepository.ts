import { getDB } from '../database';
import type { Survey } from '../../types/survey';

export const surveyRepository = {
  async getAll(): Promise<Survey[]> {
    const db = await getDB();
    return db.getAll('surveys');
  },

  async getById(id: string): Promise<Survey | undefined> {
    const db = await getDB();
    return db.get('surveys', id);
  },

  async save(survey: Survey): Promise<void> {
    const db = await getDB();
    await db.put('surveys', survey);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['surveys', 'questions'], 'readwrite');
    await tx.objectStore('surveys').delete(id);
    
    // Also delete associated questions
    const qIndex = tx.objectStore('questions').index('by-survey');
    let cursor = await qIndex.openCursor(id);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  async updateStatus(id: string, status: Survey['status']): Promise<void> {
    const db = await getDB();
    const survey = await db.get('surveys', id);
    if (survey) {
      survey.status = status;
      survey.updatedAt = new Date().toISOString();
      await db.put('surveys', survey);
    }
  }
};
