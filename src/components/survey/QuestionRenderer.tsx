import React, { useState } from 'react';
import type { Question } from '../../types/survey';
import { Star, Camera, X, Check, Loader2, MapPin, Navigation, RefreshCw } from 'lucide-react';
import { cameraService } from '../../services/camera/cameraService';
import { locationService } from '../../services/location/locationService';

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
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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

  const handleLocationCapture = async () => {
    if (disabled || locating) return;
    setLocating(true);
    setLocationError(null);
    try {
      const loc = await locationService.getCurrentPosition();
      onChange({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        formatted: loc.formatted,
        timestamp: loc.timestamp,
      });
    } catch (err: any) {
      setLocationError(err.message || 'Không thể xác định tọa độ GPS');
    } finally {
      setLocating(false);
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

      case 'location':
        const locValue = typeof value === 'object' && value !== null ? value : null;
        return (
          <div>
            {locValue ? (
              <div
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(2, 132, 199, 0.12)',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        Đã xác định tọa độ GPS
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Độ chính xác: ±{locValue.accuracy || '0'}m (Vệ tinh GPS)
                      </div>
                    </div>
                  </div>
                  {!disabled && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={handleLocationCapture}
                        title="Đo lại tọa độ GPS"
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-color, #cbd5e1)',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                        }}
                      >
                        <RefreshCw size={14} className={locating ? 'spin-animation' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange(null)}
                        title="Xóa tọa độ"
                        style={{
                          background: 'none',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: 'var(--bg-subtle, #f8fafc)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '0.84rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Lat: <strong>{typeof locValue.latitude === 'number' ? locValue.latitude.toFixed(6) : locValue.latitude}</strong></span>
                  <span>Lng: <strong>{typeof locValue.longitude === 'number' ? locValue.longitude.toFixed(6) : locValue.longitude}</strong></span>
                </div>

                {locValue.latitude && locValue.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${locValue.latitude},${locValue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      color: '#0284c7',
                      textDecoration: 'none',
                      fontWeight: 600,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Navigation size={12} />
                    Xem trên Google Maps
                  </a>
                )}
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleLocationCapture}
                  disabled={disabled || locating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px dashed #0284c7',
                    borderRadius: '8px',
                    background: 'rgba(2, 132, 199, 0.05)',
                    color: '#0284c7',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {locating ? (
                    <>
                      <Loader2 size={18} className="spin-animation" />
                      <span>Đang kết nối vệ tinh GPS thiết bị...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      <span>Lấy tọa độ GPS hiện trường (@capacitor/geolocation)</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {locationError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--status-failed)', marginTop: '6px' }}>
                {locationError}
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
