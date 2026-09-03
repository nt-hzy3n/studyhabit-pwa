import React, { useEffect, useState } from 'react';
import { GraduationCap, Wifi, WifiOff, RefreshCw, AlertCircle, Settings } from 'lucide-react';
import { networkService } from '../../services/network/networkService';
import { syncManager } from '../../services/sync/SyncManager';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const [isOnline, setIsOnline] = useState(networkService.getStatus());
  const [syncState, setSyncState] = useState({
    isSyncing: false,
    pendingCount: 0,
    lastError: undefined as string | undefined,
  });

  useEffect(() => {
    const unsubNet = networkService.subscribe((online) => setIsOnline(online));
    const unsubSync = syncManager.subscribe((state) => {
      setSyncState({
        isSyncing: state.isSyncing,
        pendingCount: state.pendingCount,
        lastError: state.lastError,
      });
    });

    return () => {
      unsubNet();
      unsubSync();
    };
  }, []);

  const handleManualSyncClick = () => {
    if (isOnline && !syncState.isSyncing) {
      syncManager.processQueue();
    }
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo" style={{ background: 'var(--primary)', color: 'white' }}>
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="brand-title" style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--primary)' }}>
            StudyHabit
          </h1>
          <p className="brand-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Khảo sát Thói quen Học tập (Offline-First)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Persistent Network Status Indicator */}
        {syncState.isSyncing ? (
          <div
            className="status-pill syncing"
            title="Đang đồng bộ phiếu khảo sát lên Google Sheets"
          >
            <RefreshCw size={12} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Đang gửi ({syncState.pendingCount})</span>
          </div>
        ) : !isOnline ? (
          <div
            className="status-pill offline"
            title="Offline — Dữ liệu đang được lưu trên thiết bị"
          >
            <WifiOff size={12} />
            <span>Offline — Lưu tại máy</span>
          </div>
        ) : syncState.pendingCount > 0 ? (
          <div
            className="status-pill"
            style={{ background: 'var(--status-pending-bg)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer' }}
            onClick={handleManualSyncClick}
            title="Bấm để đồng bộ ngay"
          >
            <AlertCircle size={12} />
            <span>Chờ gửi ({syncState.pendingCount})</span>
          </div>
        ) : (
          <div
            className="status-pill online"
            title="Online — Dữ liệu sẽ được đồng bộ tự động"
          >
            <Wifi size={12} />
            <span>Online — Sẵn sàng</span>
          </div>
        )}

        {/* Settings button */}
        <button
          className="btn-outline"
          onClick={onOpenSettings}
          title="Cài đặt Google Apps Script & Nền tảng"
          style={{
            border: 'none',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            minHeight: '34px',
            minWidth: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={18} color="var(--text-muted)" />
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
