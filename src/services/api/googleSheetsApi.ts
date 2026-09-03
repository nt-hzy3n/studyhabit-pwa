import type { SurveyResponse } from '../../types/survey';

export interface ApiResponse<T = any> {
  success: boolean;
  duplicate?: boolean;
  message?: string;
  data?: T;
  id?: string;
  responseId?: string;
  syncedAt?: string;
  error?: string;
}

const STORAGE_KEY_GAS_URL = 'studyhabit_gas_url';

export const googleSheetsApi = {
  getDeploymentUrl(): string {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_GAS_URL);
      if (stored && stored.trim() !== '') return stored.trim();
    }
    // Fallback to Vite environment variable
    return (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();
  },

  setDeploymentUrl(url: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
    }
  },

  /**
   * Submits a single survey response to Google Apps Script
   */
  async submitResponse(response: SurveyResponse): Promise<ApiResponse> {
    const url = this.getDeploymentUrl();

    if (!url) {
      throw new Error('Chưa cấu hình URL Google Apps Script. Vui lòng thiết lập biến môi trường VITE_GOOGLE_APPS_SCRIPT_URL hoặc nhập URL trong Cài đặt.');
    }

    try {
      const payload = {
        action: 'submitResponse',
        response: {
          id: response.id,
          surveyId: response.surveyId,
          surveyVersion: response.surveyVersion || 1,
          surveyTitle: response.surveyTitle || 'StudyHabit Survey',
          answers: response.answers,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
          deviceId: response.deviceId || 'pwa-client',
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Google Apps Script trả về mã lỗi HTTP ${res.status}: ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();
      if (!data.success) {
        throw new Error(data.error || data.message || 'Máy chủ Google Apps Script từ chối lưu phiếu.');
      }

      return data;
    } catch (err: any) {
      console.error('Lỗi khi gửi dữ liệu lên Google Sheets:', err);
      throw new Error(err.message || 'Không thể kết nối đến Google Sheets');
    }
  },

  /**
   * Health check to test Google Apps Script Web App connection
   */
  async testConnection(url?: string): Promise<{ ok: boolean; message: string }> {
    const targetUrl = url || this.getDeploymentUrl();
    if (!targetUrl) {
      return { ok: false, message: 'Chưa nhập URL Google Apps Script.' };
    }

    try {
      const res = await fetch(`${targetUrl}?action=healthCheck`, {
        method: 'GET',
      });
      if (!res.ok) {
        return { ok: false, message: `Lỗi kết nối: HTTP ${res.status}` };
      }
      const data = await res.json();
      if (data.status === 'ok' || data.success) {
        return { ok: true, message: data.message || 'Kết nối Google Apps Script thành công!' };
      }
      return { ok: false, message: data.error || 'Phản hồi không hợp lệ từ máy chủ' };
    } catch (err: any) {
      return { ok: false, message: `Kết nối thất bại: ${err.message || err}` };
    }
  },
};
