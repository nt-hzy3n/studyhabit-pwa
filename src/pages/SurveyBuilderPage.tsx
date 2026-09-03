import React, { useState } from 'react';
import type { Survey, Question, QuestionType } from '../types/survey';
import { surveyRepository } from '../db/repositories/surveyRepository';
import { questionRepository } from '../db/repositories/questionRepository';
import { generateUUID } from '../utils/uuid';
import { DynamicQuestionField } from '../components/survey/DynamicQuestionField';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface SurveyBuilderPageProps {
  onSurveyPublished: (survey: Survey) => void;
}

export const SurveyBuilderPage: React.FC<SurveyBuilderPageProps> = ({
  onSurveyPublished,
}) => {
  const [surveyId] = useState(generateUUID());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Nghiên cứu Hiện trường');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: generateUUID(),
      surveyId,
      order: 1,
      label: 'Câu hỏi mẫu 1',
      type: 'text',
      required: true,
      placeholder: 'Nhập câu trả lời...',
    },
  ]);
  const [isPreview, setIsPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: generateUUID(),
      surveyId,
      order: questions.length + 1,
      label: `Câu hỏi ${questions.length + 1}`,
      type: 'text',
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      setErrorMessage('Một khảo sát cần có tối thiểu một câu hỏi.');
      return;
    }
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(updated);
    setErrorMessage(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const copy = [...questions];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const updated = copy.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(updated);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handlePublish = async (status: 'published' | 'draft') => {
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên tiêu đề cho khảo sát.');
      return;
    }
    if (questions.length === 0) {
      setErrorMessage('Vui lòng thêm ít nhất một câu hỏi.');
      return;
    }

    try {
      const now = new Date().toISOString();
      const newSurvey: Survey = {
        id: surveyId,
        title: title.trim(),
        description: description.trim() || 'Biểu mẫu khảo sát hiện trường tự định nghĩa.',
        topic: topic.trim() || 'Khảo sát Chung',
        status,
        createdAt: now,
        updatedAt: now,
        isOfficial: false,
      };

      await surveyRepository.save(newSurvey);
      await questionRepository.saveBatch(questions);

      setSaveSuccess(true);
      setErrorMessage(null);
      setTimeout(() => {
        onSurveyPublished(newSurvey);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu khảo sát');
    }
  };

  const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
    { type: 'text', label: 'Văn bản ngắn' },
    { type: 'textarea', label: 'Đoạn văn chi tiết' },
    { type: 'number', label: 'Giá trị số' },
    { type: 'singleChoice', label: 'Một lựa chọn (Radio)' },
    { type: 'multipleChoice', label: 'Nhiều lựa chọn (Hộp kiểm)' },
    { type: 'yesNo', label: 'Có / Không' },
    { type: 'rating', label: 'Đánh giá 1–5 Sao' },
    { type: 'date', label: 'Ngày tháng' },
    { type: 'time', label: 'Thời gian' },
    { type: 'photo', label: 'Ảnh chụp / Camera' },
  ];

  return (
    <div className="survey-builder-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Thiết kế Khảo sát
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Xây dựng biểu mẫu câu hỏi động linh hoạt
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsPreview(!isPreview)}
        >
          <Eye size={14} />
          <span>{isPreview ? 'Sửa biểu mẫu' : 'Xem trước'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '0.82rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Đã xuất bản và lưu khảo sát vào IndexedDB thành công!</span>
          </div>
        </div>
      )}

      {isPreview ? (
        <div>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '14px' }}>
            <span className="badge badge-official" style={{ marginBottom: '6px' }}>{topic}</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title || 'Khảo sát chưa đặt tên'}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {description || 'Chưa có phần mô tả.'}
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px' }}>Giao diện Xem trước</h4>
            {questions.map((q) => (
              <DynamicQuestionField
                key={q.id}
                question={q}
                value={previewAnswers[q.id]}
                onChange={(val) => setPreviewAnswers((prev) => ({ ...prev, [q.id]: val }))}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Survey Metadata */}
          <div className="card">
            <h3 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '12px' }}>Thông tin Khảo sát</h3>

            <div className="form-group">
              <label className="form-label">Tên khảo sát *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Khảo sát Phương tiện Đi lại của Sinh viên"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chủ đề khảo sát</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Kiểm toán CSVC, Nghiên cứu Xã hội, Môi trường"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả mục tiêu</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Mô tả mục tiêu nghiên cứu hoặc hướng dẫn người tham gia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Question List */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>Danh sách câu hỏi ({questions.length})</h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddQuestion}
              >
                <Plus size={14} />
                <span>Thêm câu hỏi</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q, index) => (
                <div key={q.id} className="card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      Câu {index + 1}
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '4px 8px', minHeight: '28px' }}
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        title="Di chuyển lên"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '4px 8px', minHeight: '28px' }}
                        disabled={index === questions.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        title="Di chuyển xuống"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '4px 8px', minHeight: '28px', color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => handleRemoveQuestion(q.id)}
                        title="Xóa câu hỏi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nội dung câu hỏi..."
                      value={q.label}
                      onChange={(e) => handleUpdateQuestion(q.id, { label: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Loại câu hỏi
                      </label>
                      <select
                        className="form-select"
                        value={q.type}
                        onChange={(e) => {
                          const newType = e.target.value as QuestionType;
                          const updates: Partial<Question> = { type: newType };
                          if (
                            (newType === 'singleChoice' || newType === 'multipleChoice') &&
                            (!q.options || q.options.length === 0)
                          ) {
                            updates.options = ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3'];
                          }
                          handleUpdateQuestion(q.id, updates);
                        }}
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.type} value={t.type}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => handleUpdateQuestion(q.id, { required: e.target.checked })}
                          style={{ width: '16px', height: '16px' }}
                        />
                        Bắt buộc trả lời
                      </label>
                    </div>
                  </div>

                  {(q.type === 'singleChoice' || q.type === 'multipleChoice') && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Các lựa chọn (ngăn cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Lựa chọn 1, Lựa chọn 2, Lựa chọn 3"
                        value={(q.options || []).join(', ')}
                        onChange={(e) => {
                          const parts = e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          handleUpdateQuestion(q.id, { options: parts });
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => handlePublish('draft')}
            >
              <Save size={16} />
              <span>Lưu bản nháp</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1.2 }}
              onClick={() => handlePublish('published')}
            >
              <Sparkles size={16} />
              <span>Xuất bản khảo sát</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
