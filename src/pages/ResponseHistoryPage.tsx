import React, { useState, useEffect } from 'react';
import type { SurveyResponse, ResponseStatus } from '../types/survey';
import { responseRepository } from '../db/repositories/responseRepository';
import { syncManager } from '../services/sync/SyncManager';
import {
  RefreshCw,
  FileEdit,
  Trash2,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';

interface ResponseHistoryPageProps {
  onResumeDraft: (surveyId: string, responseId: string) => void;
}

export const ResponseHistoryPage: React.FC<ResponseHistoryPageProps> = ({
  onResumeDraft,
}) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | ResponseStatus>('ALL');
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const all = await responseRepository.getAll();
      setResponses(all);
    } catch (e) {
      console.error('Không thể tải lịch sử phiếu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
    const unsubSync = syncManager.subscribe(() => {
      loadResponses();
    });
    return unsubSync;
  }, []);

  const handleRetry = async (e: React.MouseEvent, res: SurveyResponse) => {
    e.stopPropagation();
    setIsRetrying(res.id);
    try {
      await syncManager.retryItem(res.id);
      await loadResponses();
    } catch (err) {
      console.error('Thử lại đồng bộ thất bại:', err);
    } finally {
      setIsRetrying(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, resId: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa bản ghi này khỏi bộ nhớ máy?')) {
      await responseRepository.delete(resId);
      if (selectedResponse?.id === resId) setSelectedResponse(null);
      await loadResponses();
    }
  };

  const filteredResponses = responses.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status: ResponseStatus) => {
    switch (status) {
      case 'SYNCED':
        return (
          <span className="badge badge-synced" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>🟢</span>
            <span>Đã đồng bộ</span>
          </span>
        );
      case 'PENDING_SYNC':
        return (
          <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>🟡</span>
            <span>Chờ gửi (Offline)</span>
          </span>
        );
      case 'SYNCING':
        return (
          <span className="badge badge-syncing" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} className="spin-animation" />
            <span>Đang gửi...</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="badge badge-draft" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FileEdit size={12} />
            <span>Bản nháp</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge badge-failed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>🔴</span>
            <span>Lỗi gửi</span>
          </span>
        );
      default:
        return null;
    }
  };

  const filterOptions = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING_SYNC', label: '🟡 Chờ gửi' },
    { key: 'SYNCED', label: '🟢 Đã gửi' },
    { key: 'DRAFT', label: '📝 Bản nháp' },
    { key: 'FAILED', label: '🔴 Lỗi' },
  ] as const;

  return (
    <div className="response-history-page">
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          My Responses (Lịch sử Phiếu Gửi)
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Dữ liệu lưu an toàn trên thiết bị (IndexedDB) & Tự động đồng bộ Google Sheets
        </p>
      </div>

      {/* Status Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '14px',
        }}
      >
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`badge ${filterStatus === opt.key ? 'badge-official' : ''}`}
            onClick={() => setFilterStatus(opt.key as any)}
            style={{
              padding: '6px 12px',
              fontSize: '0.74rem',
              cursor: 'pointer',
              border: filterStatus === opt.key ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              background: filterStatus === opt.key ? 'var(--primary-light)' : 'white',
              color: filterStatus === opt.key ? 'var(--primary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Responses List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách phiếu từ IndexedDB...</p>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Không có phiếu nào trong mục này.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredResponses.map((res) => {
            const answerCount = Object.keys(res.answers || {}).length;
            const major = res.answers['sh-q2'] || res.answers['Ngành học'];
            const year = res.answers['sh-q1'] || res.answers['Năm học'];
            const subtitle = major && year ? `${major} • ${year}` : null;

            return (
              <div
                key={res.id}
                className="card"
                onClick={() => setSelectedResponse(res)}
                style={{
                  cursor: 'pointer',
                  margin: 0,
                  transition: 'transform 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {res.surveyTitle || 'Khảo sát thói quen học tập'}
                    </h3>
                    {subtitle && (
                      <p style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                        {subtitle}
                      </p>
                    )}
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Ngày gửi: {new Date(res.createdAt).toLocaleDateString('vi-VN')} {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div>{getStatusBadge(res.status)}</div>
                </div>

                {res.status === 'FAILED' && res.lastError && (
                  <p style={{ fontSize: '0.74rem', color: 'var(--status-failed)', marginTop: '8px' }}>
                    Lỗi: {res.lastError}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      UUID: {res.id.slice(0, 8)}...
                    </span>
                    <span className="badge" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      <FileText size={10} style={{ marginRight: '3px' }} />
                      {answerCount} câu trả lời
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {res.status === 'DRAFT' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResumeDraft(res.surveyId, res.id);
                        }}
                      >
                        <FileEdit size={14} />
                        <span>Tiếp tục</span>
                      </button>
                    )}

                    {(res.status === 'FAILED' || res.status === 'PENDING_SYNC') && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={(e) => handleRetry(e, res)}
                        disabled={isRetrying === res.id}
                        style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                      >
                        {isRetrying === res.id ? (
                          <RefreshCw size={13} className="spin-animation" />
                        ) : (
                          <RefreshCw size={13} />
                        )}
                        <span>Gửi lại</span>
                      </button>
                    )}

                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Detail Bottom Sheet */}
      {selectedResponse && (
        <div className="modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Chi tiết Phiếu Khảo sát</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  UUID: {selectedResponse.id}
                </p>
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setSelectedResponse(null)}
                style={{ border: 'none', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              {getStatusBadge(selectedResponse.status)}
              {selectedResponse.syncedAt && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Đồng bộ lúc: {new Date(selectedResponse.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(selectedResponse.syncedAt).toLocaleDateString('vi-VN')})
                </span>
              )}
            </div>

            <div className="card" style={{ marginBottom: '16px', maxHeight: '360px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px' }}>
                Nội dung các câu trả lời ({Object.keys(selectedResponse.answers || {}).length} mục)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(selectedResponse.answers || {}).map(([key, val]) => (
                  <div key={key} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Mã câu hỏi: {key}
                    </div>
                    <div style={{ fontSize: '0.9rem', marginTop: '2px', fontWeight: 500 }}>
                      {typeof val === 'string' && val.startsWith('data:image') ? (
                        <div style={{ marginTop: '4px', maxWidth: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <img src={val} alt="Ảnh chụp minh chứng" style={{ width: '100%', display: 'block' }} />
                        </div>
                      ) : Array.isArray(val) ? (
                        val.join(', ')
                      ) : (
                        String(val)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {(selectedResponse.status === 'FAILED' || selectedResponse.status === 'PENDING_SYNC') && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={(e) => handleRetry(e, selectedResponse)}
                >
                  <RefreshCw size={14} />
                  <span>Thử gửi lại ngay</span>
                </button>
              )}

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => handleDelete(e, selectedResponse.id)}
              >
                <Trash2 size={14} />
                <span>Xóa bản ghi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
