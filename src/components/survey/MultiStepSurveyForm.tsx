import React, { useState, useEffect, useRef } from 'react';
import type { Survey, Question, SurveyResponse } from '../../types/survey';
import { QuestionRenderer } from './QuestionRenderer';
import { responseRepository } from '../../db/repositories/responseRepository';
import { syncManager } from '../../services/sync/SyncManager';
import { generateUUID } from '../../utils/uuid';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Star,
  User,
  BookOpen,
  Compass,
  Cpu,
  Moon,
  HelpCircle,
} from 'lucide-react';

interface MultiStepSurveyFormProps {
  survey: Survey;
  questions: Question[];
  initialResponseId?: string;
  onBack: () => void;
  onSubmitSuccess: (response: SurveyResponse) => void;
}

export const MultiStepSurveyForm: React.FC<MultiStepSurveyFormProps> = ({
  survey,
  questions,
  initialResponseId,
  onBack,
  onSubmitSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [responseId, setResponseId] = useState<string>(initialResponseId || generateUUID());
  const [draftSavedMessage, setDraftSavedMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(true);

  // Group questions by step if defined, or dynamically slice into logical chunks
  const hasDefinedSteps = questions.some((q) => q.step && q.step > 0);
  const maxContentStep = hasDefinedSteps
    ? Math.max(...questions.map((q) => q.step || 1))
    : 5;
  const reviewStep = maxContentStep + 1;
  const totalSteps = reviewStep;

  useEffect(() => {
    let isMounted = true;
    async function loadExistingDraft() {
      try {
        let draft: SurveyResponse | undefined;
        if (initialResponseId) {
          draft = await responseRepository.getById(initialResponseId);
        } else {
          draft = await responseRepository.getActiveDraft(survey.id);
        }

        if (isMounted && draft) {
          setResponseId(draft.id);
          setAnswers(draft.answers || {});
        }
      } catch (e) {
        console.error('Không thể tải bản nháp từ IndexedDB:', e);
      } finally {
        if (isMounted) setIsDraftLoading(false);
      }
    }

    loadExistingDraft();
    return () => {
      isMounted = false;
    };
  }, [survey.id, initialResponseId]);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Auto-save draft into IndexedDB
  const saveDraft = async (silent = false) => {
    try {
      const now = new Date().toISOString();
      const draftResponse: SurveyResponse = {
        id: responseId,
        surveyId: survey.id,
        surveyTitle: survey.title,
        surveyVersion: survey.version || 1,
        answers: answersRef.current,
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
      };

      await responseRepository.save(draftResponse);
      if (!silent) {
        setDraftSavedMessage('Đã lưu bản nháp vào IndexedDB (Tự động bảo toàn dữ liệu)');
        setTimeout(() => setDraftSavedMessage(null), 3000);
      }
    } catch (e) {
      console.error('Lỗi khi tự động lưu bản nháp vào IndexedDB:', e);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      return updated;
    });
    setValidationError(null);
  };

  // Debounced auto-save on answer update
  useEffect(() => {
    if (isDraftLoading) return;
    const timer = setTimeout(() => {
      saveDraft(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [answers, isDraftLoading]);

  const getStepQuestions = (stepIndex: number): Question[] => {
    if (hasDefinedSteps) {
      return questions.filter((q) => (q.step || 1) === stepIndex);
    } else {
      const itemsPerStep = Math.ceil(questions.length / 5);
      const start = (stepIndex - 1) * itemsPerStep;
      return questions.slice(start, start + itemsPerStep);
    }
  };

  const currentQuestions = getStepQuestions(currentStep);

  const validateStep = (stepIndex: number): boolean => {
    const questionsToValidate = getStepQuestions(stepIndex);
    for (const q of questionsToValidate) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          const displayLabel = q.title || q.label || 'Câu hỏi';
          setValidationError(`Vui lòng hoàn thành câu hỏi bắt buộc: "${displayLabel}"`);
          return false;
        }
      }
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setValidationError(null);
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Comprehensive final validation of all required questions
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          const displayLabel = q.title || q.label || 'Câu hỏi';
          setValidationError(`Chưa hoàn thành câu hỏi bắt buộc: "${displayLabel}"`);
          if (q.step && q.step !== currentStep) {
            setCurrentStep(q.step);
          }
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const finalResponse: SurveyResponse = {
        id: responseId,
        surveyId: survey.id,
        surveyTitle: survey.title,
        surveyVersion: survey.version || 1,
        answers,
        status: 'PENDING_SYNC',
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
      };

      // 1. ALWAYS save response locally first to IndexedDB
      await responseRepository.save(finalResponse);

      // 2. Queue into SyncManager
      await syncManager.queueResponse(finalResponse.id, survey.id);

      onSubmitSuccess(finalResponse);
    } catch (err: any) {
      setValidationError(`Lỗi khi lưu phiếu khảo sát: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepMetadata = (step: number) => {
    switch (step) {
      case 1:
        return { title: 'Bước 1: Thông tin cơ bản', icon: <User size={16} /> };
      case 2:
        return { title: 'Bước 2: Thói quen học tập', icon: <Compass size={16} /> };
      case 3:
        return { title: 'Bước 3: Phương pháp học tập', icon: <BookOpen size={16} /> };
      case 4:
        return { title: 'Bước 4: Mức độ tập trung & Công nghệ', icon: <Cpu size={16} /> };
      case 5:
        return { title: 'Bước 5: Giấc ngủ & Tự đánh giá', icon: <Moon size={16} /> };
      case 6:
        return { title: 'Bước 6: Xem lại & Hoàn tất gửi', icon: <FileCheck size={16} /> };
      default:
        return { title: `Bước ${step} / ${totalSteps}`, icon: <HelpCircle size={16} /> };
    }
  };

  if (isDraftLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải bản nháp khảo sát từ IndexedDB...</p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="survey-form-container">
      {/* Form Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <button
          type="button"
          className="btn-outline"
          onClick={onBack}
          style={{ padding: '8px 12px', minHeight: '38px', borderRadius: 'var(--radius-sm)' }}
        >
          <ArrowLeft size={16} />
          <span>Thoát</span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {survey.title}
          </h2>
          <span className="badge badge-official" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
            {survey.topic}
          </span>
        </div>
      </div>

      {/* Stepper Header with Progress Bar */}
      <div className="stepper-header card" style={{ padding: '14px', marginBottom: '16px' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            <span>Tiến độ hoàn thành</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'var(--primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Step Indicator Circles */}
        <div className="step-indicator">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
            const isCompleted = s < currentStep;
            const isActive = s === currentStep;
            return (
              <div
                key={s}
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (s < currentStep) setCurrentStep(s);
                }}
                style={{ cursor: s < currentStep ? 'pointer' : 'default' }}
              >
                <div className="step-circle">
                  {isCompleted ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className="step-label">
                  {s === reviewStep ? 'Xem lại' : `B.${s}`}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginTop: '6px' }}>
          {getStepMetadata(currentStep).icon}
          <span>{getStepMetadata(currentStep).title}</span>
        </div>
      </div>

      {/* Validation or Info Banners */}
      {validationError && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
            <AlertTriangle size={18} />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {draftSavedMessage && (
        <div className="card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', padding: '10px 14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '0.82rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>{draftSavedMessage}</span>
          </div>
        </div>
      )}

      {/* Step Content: Question Fields OR Review Summary */}
      <div className="card">
        {currentStep < reviewStep ? (
          <div>
            {currentQuestions.map((question) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(val) => handleAnswerChange(question.id, val)}
              />
            ))}
          </div>
        ) : (
          /* Step 6: Review Summary */
          <div className="review-section">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
              Kiểm tra lại toàn bộ thông tin khảo sát
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              Phiếu sẽ luôn được <strong>lưu trữ ngoại tuyến tại thiết bị trước (IndexedDB)</strong> với mã UUID định danh duy nhất. Sau đó hệ thống sẽ tự động đồng bộ lên Google Sheets ngay khi có kết nối mạng.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q) => {
                const answerVal = answers[q.id];
                const displayLabel = q.title || q.label || 'Câu hỏi';
                return (
                  <div
                    key={q.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', flex: 1, paddingRight: '8px' }}>
                        {displayLabel}
                      </span>
                      {q.step && (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => setCurrentStep(q.step || 1)}
                          style={{ fontSize: '0.72rem', padding: '2px 8px', minHeight: '26px' }}
                        >
                          Sửa
                        </button>
                      )}
                    </div>

                    <div style={{ marginTop: '4px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {q.type === 'photo' && answerVal ? (
                        <div style={{ marginTop: '6px', maxWidth: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <img src={answerVal} alt="Ảnh minh chứng" style={{ width: '100%', display: 'block' }} />
                        </div>
                      ) : q.type === 'rating' && answerVal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {Array.from({ length: Number(answerVal) || 0 }).map((_, i) => (
                            <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                          ))}
                          <span style={{ marginLeft: '4px', fontWeight: 700 }}>({answerVal}/{q.max || 5} Sao)</span>
                        </div>
                      ) : q.type === 'multipleChoice' && Array.isArray(answerVal) ? (
                        <span>{answerVal.join(', ') || '(Chưa chọn)'}</span>
                      ) : (
                        <span>{answerVal !== undefined && answerVal !== null && answerVal !== '' ? String(answerVal) : '(Chưa cung cấp)'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: [Previous] [Next] [Save Draft] [Submit] */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: currentStep > 1 ? '1fr 1fr' : '1fr', gap: '10px' }}>
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
          )}

          {currentStep < reviewStep ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              <span>Tiếp tục</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ background: 'var(--status-synced)' }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Đang lưu vào thiết bị...' : 'Nộp phiếu khảo sát'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => saveDraft(false)}
          disabled={isSubmitting}
          style={{ borderColor: '#cbd5e1' }}
        >
          <Save size={16} />
          <span>Lưu bản nháp cục bộ</span>
        </button>
      </div>
    </div>
  );
};
