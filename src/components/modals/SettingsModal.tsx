import React, { useState, useEffect } from 'react';
import { X, Cloud, CheckCircle, AlertCircle, RefreshCw, Database, ShieldCheck, Link2 } from 'lucide-react';
import { googleSheetsApi } from '../../services/api/googleSheetsApi';
import { syncQueueRepository } from '../../db/repositories/syncQueueRepository';
import { responseRepository } from '../../db/repositories/responseRepository';
import { surveyRepository } from '../../db/repositories/surveyRepository';
import { initializeDatabase } from '../../db/database';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [gasUrl, setGasUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState({ surveys: 0, responses: 0, queue: 0 });

  const loadStats = async () => {
    const surveys = await surveyRepository.getAll();
    const responses = await responseRepository.getAll();
    const queue = await syncQueueRepository.getCount();
    setStats({
      surveys: surveys.length,
      responses: responses.length,
      queue,
    });
  };

  useEffect(() => {
    if (isOpen) {
      setGasUrl(googleSheetsApi.getDeploymentUrl());
      setTestResult(null);
      setSaveSuccess(false);
      loadStats();
    }
  }, [isOpen]);

  const handleSave = () => {
    googleSheetsApi.setDeploymentUrl(gasUrl);
    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await googleSheetsApi.testConnection(gasUrl);
      setTestResult({
        ok: res.ok,
        message: res.ok ? 'Kết nối tới Google Apps Script thành công!' : res.message,
      });
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || 'Kiểm tra kết nối thất bại' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Cập nhật lại danh sách khảo sát và bộ 20 câu hỏi mặc định của StudyHabit? Phiếu bạn đã nộp sẽ được giữ nguyên.')) {
      await initializeDatabase();
      await loadStats();
      alert('Đã cập nhật dữ liệu StudyHabit thành công!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cài đặt Nền tảng StudyHabit</h3>
          </div>
          <button
            type="button"
            className="btn-outline"
            onClick={onClose}
            style={{ border: 'none', padding: '6px', minHeight: '32px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Google Apps Script Configuration */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '6px' }}>
            URL Web App Google Apps Script
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Kết nối ứng dụng StudyHabit PWA với cơ sở dữ liệu Google Sheets. Có thể cấu hình thông qua biến môi trường <code>VITE_GOOGLE_APPS_SCRIPT_URL</code> hoặc dán trực tiếp tại đây.
          </p>

          <input
            type="url"
            className="form-input"
            value={gasUrl}
            onChange={(e) => setGasUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            style={{ fontSize: '0.85rem' }}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              style={{ flex: 1 }}
            >
              Lưu cấu hình
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={isTesting || !gasUrl}
            >
              {isTesting ? <RefreshCw size={14} className="spin-animation" /> : <Link2 size={14} />}
              <span>Kiểm tra kết nối</span>
            </button>
          </div>

          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-synced)', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>
              <CheckCircle size={14} />
              <span>Đã lưu URL thành công!</span>
            </div>
          )}

          {testResult && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: testResult.ok ? 'var(--status-online-bg)' : 'var(--status-offline-bg)',
                color: testResult.ok ? 'var(--status-online)' : 'var(--status-offline)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {testResult.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Local Storage / IndexedDB status */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Database size={16} color="var(--primary)" />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Trạng thái Cơ sở dữ liệu Cục bộ (studyhabit-db)</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginTop: '10px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats.surveys}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mẫu khảo sát</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats.responses}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Phiếu đã lưu</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats.queue}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hàng đợi sync</div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm btn-block"
            onClick={handleResetData}
            style={{ marginTop: '12px', fontSize: '0.8rem' }}
          >
            Đồng bộ lại Bộ câu hỏi StudyHabit gốc
          </button>
        </div>

        {/* PWA & Architecture Information */}
        <div className="card" style={{ background: 'var(--bg-subtle)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={16} color="#0284c7" />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Cam kết Kiến trúc Offline-First</h4>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Mọi thao tác làm khảo sát đều lưu trực tiếp vào <strong>IndexedDB</strong> trước. Khi có kết nối mạng, <strong>SyncManager</strong> sẽ tuần tự gửi dữ liệu lên Google Apps Script để ghi vào Google Sheets.
          </p>
        </div>
      </div>
    </div>
  );
};
