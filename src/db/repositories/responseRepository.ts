import { getDB } from '../database';
import type { SurveyResponse, ResponseStatus } from '../../types/survey';

export interface StudyHabitMetrics {
  totalSubmitted: number;
  synced: number;
  pending: number;
  failed: number;
  drafts: number;
  avgConcentration: number;
  avgEffectiveness: number;
  avgStudyHours: string;
  locationDistribution: Record<string, number>;
  learningMethodsCount: Record<string, number>;
  socialMediaDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  sleepDistribution: Record<string, number>;
}

export const responseRepository = {
  async getAll(): Promise<SurveyResponse[]> {
    const db = await getDB();
    const responses = await db.getAll('responses');
    return responses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getById(id: string): Promise<SurveyResponse | undefined> {
    const db = await getDB();
    return db.get('responses', id);
  },

  async getBySurveyId(surveyId: string): Promise<SurveyResponse[]> {
    const db = await getDB();
    const index = db.transaction('responses').store.index('by-survey');
    const responses = await index.getAll(surveyId);
    return responses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getActiveDraft(surveyId: string): Promise<SurveyResponse | undefined> {
    const responses = await this.getBySurveyId(surveyId);
    return responses.find((r) => r.status === 'DRAFT');
  },

  async save(response: SurveyResponse): Promise<void> {
    const db = await getDB();
    await db.put('responses', response);
  },

  async updateStatus(
    id: string,
    status: ResponseStatus,
    extra?: { syncedAt?: string; lastError?: string; retryIncrement?: boolean }
  ): Promise<void> {
    const db = await getDB();
    const response = await db.get('responses', id);
    if (response) {
      response.status = status;
      response.updatedAt = new Date().toISOString();
      if (extra?.syncedAt) response.syncedAt = extra.syncedAt;
      if (extra?.lastError !== undefined) response.lastError = extra.lastError;
      if (extra?.retryIncrement) response.retryCount = (response.retryCount || 0) + 1;
      await db.put('responses', response);
    }
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['responses', 'syncQueue'], 'readwrite');
    await tx.objectStore('responses').delete(id);

    // Also remove from syncQueue if present
    const qIndex = tx.objectStore('syncQueue').index('by-response');
    let cursor = await qIndex.openCursor(id);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  async getStats(): Promise<{
    total: number;
    drafts: number;
    pending: number;
    syncing: number;
    synced: number;
    failed: number;
  }> {
    const all = await this.getAll();
    return {
      total: all.length,
      drafts: all.filter((r) => r.status === 'DRAFT').length,
      pending: all.filter((r) => r.status === 'PENDING_SYNC').length,
      syncing: all.filter((r) => r.status === 'SYNCING').length,
      synced: all.filter((r) => r.status === 'SYNCED').length,
      failed: all.filter((r) => r.status === 'FAILED').length,
    };
  },

  async getStudyHabitMetrics(): Promise<StudyHabitMetrics> {
    const all = await this.getAll();
    const submitted = all.filter((r) => r.status !== 'DRAFT');

    const locationCount: Record<string, number> = {};
    const methodCount: Record<string, number> = {};
    const socialMediaCount: Record<string, number> = {};
    const deviceCount: Record<string, number> = {};
    const sleepCount: Record<string, number> = {};

    let totalConcentration = 0;
    let concentrationEntries = 0;
    let totalEffectiveness = 0;
    let effectivenessEntries = 0;
    const studyHoursCount: Record<string, number> = {};

    for (const r of submitted) {
      const answers = r.answers || {};

      // Q3: Study time
      const studyTime = answers['sh-q3'];
      if (studyTime) {
        studyHoursCount[studyTime] = (studyHoursCount[studyTime] || 0) + 1;
      }

      // Q6: Study location
      const loc = answers['sh-q6'];
      if (loc) {
        locationCount[loc] = (locationCount[loc] || 0) + 1;
      }

      // Q8: Learning methods (multiple choice)
      const methods = answers['sh-q8'];
      if (Array.isArray(methods)) {
        methods.forEach((m) => {
          methodCount[m] = (methodCount[m] || 0) + 1;
        });
      }

      // Q11: Concentration (rating 1-5)
      const conc = Number(answers['sh-q11']);
      if (conc > 0) {
        totalConcentration += conc;
        concentrationEntries++;
      }

      // Q12: Social media distraction (rating 1-5)
      const sm = answers['sh-q12'];
      if (sm) {
        const smKey = `${sm} Sao`;
        socialMediaCount[smKey] = (socialMediaCount[smKey] || 0) + 1;
      }

      // Q13: Devices
      const dev = answers['sh-q13'];
      if (dev) {
        deviceCount[dev] = (deviceCount[dev] || 0) + 1;
      }

      // Q15: Sleep duration
      const sleep = answers['sh-q15'];
      if (sleep) {
        sleepCount[sleep] = (sleepCount[sleep] || 0) + 1;
      }

      // Q17: Effectiveness (rating 1-5)
      const eff = Number(answers['sh-q17']);
      if (eff > 0) {
        totalEffectiveness += eff;
        effectivenessEntries++;
      }
    }

    // Determine top study time range
    let topStudyHours = 'Chưa có dữ liệu';
    let maxStudyCount = 0;
    for (const [k, v] of Object.entries(studyHoursCount)) {
      if (v > maxStudyCount) {
        maxStudyCount = v;
        topStudyHours = k;
      }
    }

    return {
      totalSubmitted: submitted.length,
      synced: submitted.filter((r) => r.status === 'SYNCED').length,
      pending: submitted.filter((r) => r.status === 'PENDING_SYNC').length,
      failed: submitted.filter((r) => r.status === 'FAILED').length,
      drafts: all.filter((r) => r.status === 'DRAFT').length,
      avgConcentration: concentrationEntries ? Number((totalConcentration / concentrationEntries).toFixed(1)) : 0,
      avgEffectiveness: effectivenessEntries ? Number((totalEffectiveness / effectivenessEntries).toFixed(1)) : 0,
      avgStudyHours: topStudyHours,
      locationDistribution: locationCount,
      learningMethodsCount: methodCount,
      socialMediaDistribution: socialMediaCount,
      deviceDistribution: deviceCount,
      sleepDistribution: sleepCount,
    };
  },
};
