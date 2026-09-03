import React from 'react';
import type { Survey } from '../../types/survey';
import { ArrowRight, Award } from 'lucide-react';

interface SurveyCardProps {
  survey: Survey;
  hasDraft?: boolean;
  questionCount?: number;
  onStart: (survey: Survey) => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  hasDraft = false,
  questionCount,
  onStart,
}) => {
  return (
    <div className="card" style={{ borderLeft: survey.isOfficial ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
              {survey.topic}
            </span>
            {survey.isOfficial && (
              <span className="badge badge-official">
                <Award size={12} />
                Chính thức VKU
              </span>
            )}
            {hasDraft && (
              <span className="badge badge-pending">
                Có bản nháp
              </span>
            )}
          </div>
          <h3 className="card-title">{survey.title}</h3>
        </div>
      </div>

      <p className="card-desc">{survey.description}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {questionCount !== undefined ? `${questionCount} Câu hỏi` : 'Biểu mẫu nhiều bước'}
        </span>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onStart(survey)}
        >
          <span>{hasDraft ? 'Tiếp tục bản nháp' : 'Bắt đầu khảo sát'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
