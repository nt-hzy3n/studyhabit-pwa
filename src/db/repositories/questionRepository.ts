import { getDB } from '../database';
import type { Question } from '../../types/survey';

export const questionRepository = {
  async getBySurveyId(surveyId: string): Promise<Question[]> {
    const db = await getDB();
    const index = db.transaction('questions').store.index('by-survey');
    const questions = await index.getAll(surveyId);
    return questions.sort((a, b) => a.order - b.order);
  },

  async getById(id: string): Promise<Question | undefined> {
    const db = await getDB();
    return db.get('questions', id);
  },

  async save(question: Question): Promise<void> {
    const db = await getDB();
    await db.put('questions', question);
  },

  async saveBatch(questions: Question[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('questions', 'readwrite');
    for (const q of questions) {
      await tx.store.put(q);
    }
    await tx.done;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('questions', id);
  },

  async deleteBySurveyId(surveyId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('questions', 'readwrite');
    const index = tx.store.index('by-survey');
    let cursor = await index.openCursor(surveyId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
};
