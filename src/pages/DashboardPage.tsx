import React, { useEffect, useState } from 'react';
import type { Survey, SurveyResponse } from '../types/survey';
import { responseRepository } from '../db/repositories/responseRepository';
import type { StudyHabitMetrics } from '../db/repositories/responseRepository';
import { surveyRepository } from '../db/repositories/surveyRepository';
import { syncManager } from '../services/sync/SyncManager';
import { STUDY_HABIT_SURVEY_ID } from '../db/seedData';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Award,
  BarChart3,
  BookOpen,
  MapPin,
  Smartphone,
  Star,
  Zap,
} from 'lucide-react';

interface DashboardPageProps {
  onStartSurvey: (survey: Survey) => void;
  onNavigateTab: (tab: 'dashboard' | 'surveys' | 'responses' | 'builder') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartSurvey,
  onNavigateTab,
}) => {
  const [metrics, setMetrics] = useState<StudyHabitMetrics>({
    totalSubmitted: 0,
    synced: 0,
    pending: 0,
    failed: 0,
    drafts: 0,
    avgConcentration: 0,
    avgEffectiveness: 0,
    avgStudyHours: 'Chưa có',
    locationDistribution: {},
    learningMethodsCount: {},
    socialMediaDistribution: {},
    deviceDistribution: {},
    sleepDistribution: {},
  });

  const [studyHabitSurvey, setStudyHabitSurvey] = useState<Survey | null>(null);
  const [recentResponses, setRecentResponses] = useState<SurveyResponse[]>([]);

  const loadData = async () => {
    const m = await responseRepository.getStudyHabitMetrics();
    setMetrics(m);

    const surveys = await surveyRepository.getAll();
    const mainSurvey = surveys.find((item) => item.id === STUDY_HABIT_SURVEY_ID);
    if (mainSurvey) setStudyHabitSurvey(mainSurvey);

    const allResponses = await responseRepository.getAll();
    setRecentResponses(allResponses.slice(0, 4));
  };

  useEffect(() => {
    loadData();
    const unsub = syncManager.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  return (
    <div className="dashboard-page">
      {/* Official Survey Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          color: 'white',
          border: 'none',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Award size={12} /> Nghiên cứu Khoa học Xã hội 2026
          </span>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: 'white' }}>
          Khảo sát Thói quen Học tập của Sinh viên
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#e0f2fe', lineHeight: 1.4, marginBottom: '16px' }}>
          Thu thập dữ liệu thực địa ngoại tuyến (Offline-First) về thời gian tự học, phương pháp tiếp thu, công nghệ AI và giấc ngủ sinh viên. An toàn 100% không mất dữ liệu.
        </p>

        <button
          type="button"
          className="btn"
          style={{
            background: 'white',
            color: '#0369a1',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          onClick={() => {
            if (studyHabitSurvey) onStartSurvey(studyHabitSurvey);
          }}
        >
          <GraduationCap size={18} />
          <span>Bắt đầu điền phiếu khảo sát</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Sync Metrics 4-Box Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-number" style={{ color: 'var(--text-main)' }}>
            {metrics.totalSubmitted}
          </div>
          <div className="stat-label">Tổng số phiếu</div>
        </div>

        <div className="stat-box">
          <div className="stat-number" style={{ color: 'var(--status-synced)' }}>
            {metrics.synced}
          </div>
          <div className="stat-label">Đã đồng bộ</div>
        </div>

        <div className="stat-box">
          <div className="stat-number" style={{ color: '#b45309' }}>
            {metrics.pending}
          </div>
          <div className="stat-label">Chờ gửi (Offline)</div>
        </div>

        <div className="stat-box">
          <div className="stat-number" style={{ color: metrics.failed > 0 ? 'var(--status-failed)' : 'var(--text-muted)' }}>
            {metrics.failed}
          </div>
          <div className="stat-label">Lỗi đồng bộ</div>
        </div>
      </div>

      {/* Analytical Averages Card */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} color="var(--primary)" />
          <span>Chỉ số Thống kê Tổng hợp</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {metrics.avgStudyHours}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Thời gian học phổ biến
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{metrics.avgConcentration || '—'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Độ tập trung (TB / 5)
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Star size={16} fill="#10b981" color="#10b981" />
              <span>{metrics.avgEffectiveness || '—'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Hiệu quả học (TB / 5)
            </div>
          </div>
        </div>
      </div>

      {/* Common Study Locations Distribution */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} color="var(--primary)" />
          <span>Địa điểm tự học chủ yếu</span>
        </h3>

        {Object.keys(metrics.locationDistribution).length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            Chưa có dữ liệu phản hồi từ sinh viên.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(metrics.locationDistribution).map(([loc, count]) => {
              const pct = Math.round((count / (metrics.totalSubmitted || 1)) * 100);
              return (
                <div key={loc}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px', fontWeight: 600 }}>
                    <span>{loc}</span>
                    <span style={{ color: 'var(--primary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Common Learning Methods Distribution */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={16} color="var(--primary)" />
          <span>Phương pháp học tập phổ biến</span>
        </h3>

        {Object.keys(metrics.learningMethodsCount).length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            Chưa có phản hồi phương pháp học tập.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(metrics.learningMethodsCount).map(([method, count]) => (
              <span
                key={method}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{method}</span>
                <span
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Social Media Distraction Distribution */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={16} color="var(--primary)" />
          <span>Mức độ xao nhãng bởi Mạng xã hội</span>
        </h3>

        {Object.keys(metrics.socialMediaDistribution).length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            Chưa có dữ liệu đánh giá xao nhãng mạng xã hội.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(metrics.socialMediaDistribution).map(([rating, count]) => {
              const pct = Math.round((count / (metrics.totalSubmitted || 1)) * 100);
              return (
                <div key={rating}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px', fontWeight: 600 }}>
                    <span>Mức {rating}</span>
                    <span style={{ color: '#b45309' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Phiếu gửi gần đây</h3>
          <button
            type="button"
            className="btn-outline"
            onClick={() => onNavigateTab('responses')}
            style={{ border: 'none', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Xem tất cả
          </button>
        </div>

        {recentResponses.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            Chưa có phiếu khảo sát nào. Hãy bấm "Bắt đầu điền phiếu" để trải nghiệm nộp bài ngoại tuyến!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentResponses.map((res) => {
              const major = res.answers['sh-q2'] || res.answers['Ngành học'];
              const year = res.answers['sh-q1'] || res.answers['Năm học'];
              const summaryTitle = major && year ? `${major} (${year})` : res.surveyTitle || 'Phiếu khảo sát';

              return (
                <div
                  key={res.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {summaryTitle}
                    </p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      UUID: {res.id.slice(0, 8)}... • {new Date(res.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div>
                    {res.status === 'SYNCED' && (
                      <span className="badge badge-synced">
                        <CheckCircle2 size={12} /> Đã gửi
                      </span>
                    )}
                    {res.status === 'PENDING_SYNC' && (
                      <span className="badge badge-pending">
                        <Clock size={12} /> Chờ gửi
                      </span>
                    )}
                    {res.status === 'SYNCING' && (
                      <span className="badge badge-syncing">
                        <RefreshCw size={12} className="spin-animation" /> Đang gửi
                      </span>
                    )}
                    {res.status === 'FAILED' && (
                      <span className="badge badge-failed">
                        <AlertTriangle size={12} /> Lỗi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Python Data Analysis Link Banner */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--primary)',
          background: 'var(--bg-subtle)',
          padding: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <BarChart3 size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Mô-đun Phân tích Dữ liệu Chuyên sâu (Python / Pandas)</h4>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Dữ liệu sau khi đồng bộ lên Google Sheets có thể tải về dưới dạng CSV và chạy phân tích chuyên sâu tại thư mục <code>/analysis</code> với biểu đồ phân phối thời gian học, độ tập trung và ma trận tương quan.
        </p>
      </div>
    </div>
  );
};
