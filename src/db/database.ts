import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Survey, Question, SurveyResponse, SyncQueueItem } from '../types/survey';
import { defaultSurveys, defaultQuestions } from './seedData';

export interface StudyHabitDB extends DBSchema {
  surveys: {
    key: string;
    value: Survey;
    indexes: {
      'by-status': string;
      'by-topic': string;
    };
  };
  questions: {
    key: string;
    value: Question;
    indexes: {
      'by-survey': string;
      'by-order': number;
    };
  };
  responses: {
    key: string;
    value: SurveyResponse;
    indexes: {
      'by-survey': string;
      'by-status': string;
      'by-updated': string;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-response': string;
      'by-status': string;
      'by-timestamp': string;
    };
  };
}

const DB_NAME = 'studyhabit-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StudyHabitDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<StudyHabitDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudyHabitDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('surveys')) {
          const surveyStore = db.createObjectStore('surveys', { keyPath: 'id' });
          surveyStore.createIndex('by-status', 'status');
          surveyStore.createIndex('by-topic', 'topic');
        }

        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionStore.createIndex('by-survey', 'surveyId');
          questionStore.createIndex('by-order', 'order');
        }

        if (!db.objectStoreNames.contains('responses')) {
          const responseStore = db.createObjectStore('responses', { keyPath: 'id' });
          responseStore.createIndex('by-survey', 'surveyId');
          responseStore.createIndex('by-status', 'status');
          responseStore.createIndex('by-updated', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-response', 'responseId');
          syncStore.createIndex('by-status', 'status');
          syncStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Initializes database with default preloaded StudyHabit surveys and questions.
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['surveys', 'questions'], 'readwrite');

  for (const survey of defaultSurveys) {
    await tx.objectStore('surveys').put(survey);
  }
  for (const question of defaultQuestions) {
    await tx.objectStore('questions').put(question);
  }
  await tx.done;
}
