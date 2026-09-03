import React, { useState } from 'react';
import type { Question } from '../../types/survey';
import { Star, Camera, X, Check, Loader2 } from 'lucide-react';
import { cameraService } from '../../services/camera/cameraService';

export interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handlePhotoCapture = async () => {
    if (disabled || capturing) return;
    setCapturing(true);
    setCameraError(null);
    try {
      const photo = await cameraService.capturePhoto();
      onChange(photo.dataUrl);
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        setCameraError(err.message || 'Không thể mở camera hoặc tải ảnh lên');
      }
    } finally {
      setCapturing(false);
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-input"
            value={value || ''}
            placeholder={question.placeholder || 'Nhập câu trả lời...'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'textarea':
        return (
          <textarea
            className="form-textarea"
            value={value || ''}
            placeholder={question.placeholder || 'Nhập mô tả hoặc ý kiến chi tiết...'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-input"
            value={value !== undefined && value !== null ? value : ''}
            placeholder={question.placeholder || 'Nhập giá trị số...'}
            min={question.min}
            max={question.max}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={disabled}
          />
        );

      case 'singleChoice':
        const options = question.options || ['Lựa chọn 1', 'Lựa chọn 2'];
        return (
          <div className="choice-grid">
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <div
                  key={option}
                  className={`choice-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => !disabled && onChange(option)}
                >
                  {isSelected && <Check size={14} style={{ marginRight: '6px' }} />}
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        );

      case 'multipleChoice':
        const currentSelections: string[] = Array.isArray(value) ? value : [];
        const multOptions = question.options || ['Lựa chọn A', 'Lựa chọn B'];
        return (
          <div className="choice-grid">
            {multOptions.map((option) => {
              const isSelected = currentSelections.includes(option);
              return (
                <div
                  key={option}
                  className={`choice-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (disabled) return;
                    if (isSelected) {
                      onChange(currentSelections.filter((o) => o !== option));
                    } else {
                      onChange([...currentSelections, option]);
                    }
                  }}
                >
                  {isSelected && <Check size={14} style={{ marginRight: '6px' }} />}
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        );

      case 'yesNo':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              className={`choice-chip ${value === true || value === 'Yes' || value === 'Có' ? 'selected' : ''}`}
              onClick={() => !disabled && onChange(true)}
              disabled={disabled}
            >
              {(value === true || value === 'Yes' || value === 'Có') && <Check size={16} style={{ marginRight: '6px' }} />}
              Có
            </button>
            <button
              type="button"
              className={`choice-chip ${value === false || value === 'No' || value === 'Không' ? 'selected' : ''}`}
              onClick={() => !disabled && onChange(false)}
              disabled={disabled}
            >
              {(value === false || value === 'No' || value === 'Không') && <Check size={16} style={{ marginRight: '6px' }} />}
              Không
            </button>
          </div>
        );

      case 'rating':
        const maxRating = question.max || 5;
        const currentRating = Number(value) || 0;
        return (
          <div>
            <div className="rating-container">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((starVal) => {
                const isFilled = starVal <= currentRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    className="star-btn"
                    onClick={() => !disabled && onChange(starVal)}
                    disabled={disabled}
                    title={`${starVal} / ${maxRating} Sao`}
                  >
                    <Star
                      size={28}
                      fill={isFilled ? '#f59e0b' : 'none'}
                      color={isFilled ? '#f59e0b' : '#cbd5e1'}
                      strokeWidth={2}
                    />
                  </button>
                );
              })}
            </div>
            {currentRating > 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                Đã chọn: {currentRating} / {maxRating} Sao
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            className="form-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            className="form-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'photo':
        return (
          <div>
            {value ? (
              <div className="photo-preview-wrap">
                <img src={value} alt="Ảnh chụp minh chứng / góc học tập" className="photo-preview-img" />
                {!disabled && (
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={() => onChange(null)}
                    title="Xóa ảnh này"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ) : (
              <div
                className="photo-uploader"
                onClick={handlePhotoCapture}
                style={{ opacity: disabled ? 0.6 : 1 }}
              >
                {capturing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={28} className="spin-animation" color="var(--primary)" />
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Đang mở camera...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Camera size={22} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Chụp ảnh / Tải ảnh lên
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Hỗ trợ camera thiết bị hoặc chọn từ thư viện ảnh
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {cameraError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--status-failed)', marginTop: '6px' }}>
                {cameraError}
              </p>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className="form-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  const displayTitle = question.title || question.label || 'Câu hỏi';

  return (
    <div className="form-group">
      <label className="form-label">
        {displayTitle}
        {question.required && <span className="required-star">*</span>}
      </label>
      {question.description && <p className="form-hint">{question.description}</p>}
      <div style={{ marginTop: '6px' }}>{renderInput()}</div>
    </div>
  );
};
