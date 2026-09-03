export type SurveyStatus = 'draft' | 'published' | 'archived';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'singleChoice'
  | 'multipleChoice'
  | 'yesNo'
  | 'rating'
  | 'date'
  | 'time'
  | 'photo';

export interface Question {
  id: string;
  surveyId: string;
  order: number;
  step?: number; // Step number for multi-step wizard (1-6)
  title?: string; // Question prompt
  label: string; // Question label/prompt
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  topic: string;
  version?: number;
  status: SurveyStatus;
  isOfficial?: boolean;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export type ResponseStatus =
  | 'DRAFT'
  | 'PENDING_SYNC'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED';

export interface SurveyResponse {
  id: string; // UUID v4
  surveyId: string;
  surveyTitle?: string;
  surveyVersion?: number;
  answers: Record<string, any>;
  status: ResponseStatus;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  retryCount: number;
  lastError?: string;
  deviceId?: string;
}

export interface SyncQueueItem {
  id: string; // UUID
  responseId: string;
  surveyId: string;
  timestamp: string;
  retryCount: number;
  status: 'PENDING' | 'FAILED';
  lastAttempt?: string;
  errorMessage?: string;
}

export interface NetworkState {
  connected: boolean;
  connectionType?: string;
}

export interface AppConfig {
  gasDeploymentUrl: string;
  autoSync: boolean;
  soundFeedback: boolean;
}
