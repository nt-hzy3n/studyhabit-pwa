import React, { useState, useEffect } from 'react';
import type { Survey } from '../types/survey';
import { surveyRepository } from '../db/repositories/surveyRepository';
import { questionRepository } from '../db/repositories/questionRepository';
import { responseRepository } from '../db/repositories/responseRepository';
import { SurveyCard } from '../components/survey/SurveyCard';
import { Search, PlusCircle } from 'lucide-react';

interface SurveyListPageProps {
  onStartSurvey: (survey: Survey) => void;
  onCreateSurveyClick: () => void;
}

export const SurveyListPage: React.FC<SurveyListPageProps> = ({
  onStartSurvey,
  onCreateSurveyClick,
}) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [draftMap, setDraftMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('Tất cả');
  const [loading, setLoading] = useState(true);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const allSurveys = await surveyRepository.getAll();
      setSurveys(allSurveys);

      const counts: Record<string, number> = {};
      const drafts: Record<string, boolean> = {};

      for (const s of allSurveys) {
        const questions = await questionRepository.getBySurveyId(s.id);
        counts[s.id] = questions.length;

        const draft = await responseRepository.getActiveDraft(s.id);
        drafts[s.id] = !!draft;
      }

      setQuestionCounts(counts);
      setDraftMap(drafts);
    } catch (e) {
      console.error('Không thể tải danh sách khảo sát:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const topics = ['Tất cả', ...Array.from(new Set(surveys.map((s) => s.topic)))];

  const filteredSurveys = surveys.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'Tất cả' || s.topic === selectedTopic;
    return matchesSearch && matchesTopic && s.status !== 'archived';
  });

  return (
    <div className="survey-list-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Danh sách Khảo sát
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Biểu mẫu khảo sát hiện trường hỗ trợ ngoại tuyến
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onCreateSurveyClick}
        >
          <PlusCircle size={15} />
          <span>Tạo mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Tìm kiếm theo tên hoặc chủ đề khảo sát..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '38px', minHeight: '42px', fontSize: '0.88rem' }}
        />
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
      </div>

      {/* Topic Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            className={`badge ${selectedTopic === t ? 'badge-official' : ''}`}
            onClick={() => setSelectedTopic(t)}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              border: selectedTopic === t ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              background: selectedTopic === t ? 'var(--primary-light)' : 'white',
              color: selectedTopic === t ? 'var(--primary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Survey Cards List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách khảo sát...</p>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Không tìm thấy khảo sát phù hợp với từ khóa.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')}>
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredSurveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              hasDraft={draftMap[survey.id]}
              questionCount={questionCounts[survey.id]}
              onStart={onStartSurvey}
            />
          ))}
        </div>
      )}
    </div>
  );
};
