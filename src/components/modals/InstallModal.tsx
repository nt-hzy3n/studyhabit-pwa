import React from 'react';
import { X, Smartphone, Download, Apple, Laptop } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerNativeInstall?: () => void;
  canInstallNatively: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerNativeInstall,
  canInstallNatively,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: 'white',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                Cài đặt ứng dụng StudyHabit
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                Thêm vào màn hình chính để dùng offline 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          {canInstallNatively && (
            <div
              style={{
                marginBottom: '18px',
                padding: '14px',
                background: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #bae6fd',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>
                Trình duyệt của bạn đã sẵn sàng để cài đặt trực tiếp!
              </p>
              <button
                onClick={() => {
                  if (onTriggerNativeInstall) onTriggerNativeInstall();
                  onClose();
                }}
                style={{
                  background: '#0284c7',
                  color: 'white',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Download size={16} /> Cài đặt ứng dụng ngay
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Guide 1: Android Chrome */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Smartphone size={16} color="#16a34a" />
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                  1. Điện thoại Android (Google Chrome)
                </strong>
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                <li>Nhấn nút <strong>3 dấu chấm (⋮)</strong> ở góc trên bên phải trình duyệt.</li>
                <li>Chọn mục <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.</li>
                <li>Xác nhận <strong>Cài đặt</strong> — Biểu tượng StudyHabit sẽ xuất hiện trên màn hình điện thoại!</li>
              </ol>
            </div>

            {/* Guide 2: iOS Safari */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Apple size={16} color="#0284c7" />
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                  2. iPhone / iPad (Trình duyệt Safari)
                </strong>
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                <li>Mở link bằng <strong>Safari</strong>.</li>
                <li>Nhấn vào nút <strong>Chia sẻ (ô vuông có mũi tên lên ⎋)</strong> ở thanh công cụ dưới.</li>
                <li>Cuộn xuống chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.</li>
              </ol>
            </div>

            {/* Guide 3: Desktop Chrome / Edge */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Laptop size={16} color="#6366f1" />
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                  3. Máy tính Laptop / PC (Chrome hoặc Edge)
                </strong>
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                <li>Nhìn vào <strong>góc phải thanh địa chỉ URL</strong> trên cùng.</li>
                <li>Bấm vào biểu tượng <strong>máy tính có mũi tên tải xuống [ 💻⬇ ]</strong> (ngay cạnh ngôi sao Bookmark).</li>
                <li>Bấm <strong>Cài đặt (Install)</strong> để mở cửa sổ độc lập.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
