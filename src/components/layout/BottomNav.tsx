import React from 'react';
import { LayoutDashboard, ClipboardList, History, PlusCircle } from 'lucide-react';

export type NavTab = 'dashboard' | 'surveys' | 'responses' | 'builder';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 0,
}) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <div className="nav-icon-wrap">
          <LayoutDashboard size={19} />
        </div>
        <span>Tổng quan</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'surveys' ? 'active' : ''}`}
        onClick={() => onSelectTab('surveys')}
      >
        <div className="nav-icon-wrap">
          <ClipboardList size={19} />
        </div>
        <span>Khảo sát</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'responses' ? 'active' : ''}`}
        onClick={() => onSelectTab('responses')}
        style={{ position: 'relative' }}
      >
        <div className="nav-icon-wrap">
          <History size={19} />
        </div>
        <span>Lịch sử</span>
        {pendingCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '12px',
              background: '#f59e0b',
              color: 'white',
              fontSize: '0.62rem',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      <button
        className={`nav-item ${currentTab === 'builder' ? 'active' : ''}`}
        onClick={() => onSelectTab('builder')}
      >
        <div className="nav-icon-wrap">
          <PlusCircle size={19} />
        </div>
        <span>Tạo mẫu</span>
      </button>
    </nav>
  );
};
