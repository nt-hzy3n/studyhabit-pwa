import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { SurveyListPage } from './pages/SurveyListPage';
import { ResponseHistoryPage } from './pages/ResponseHistoryPage';
import { SurveyBuilderPage } from './pages/SurveyBuilderPage';
import { MultiStepSurveyForm } from './components/survey/MultiStepSurveyForm';
import { SettingsModal } from './components/modals/SettingsModal';
import { InstallModal } from './components/modals/InstallModal';
import type { Survey, Question, SurveyResponse } from './types/survey';
import { questionRepository } from './db/repositories/questionRepository';
import { surveyRepository } from './db/repositories/surveyRepository';
import { networkService } from './services/network/networkService';
import { syncManager } from './services/sync/SyncManager';
import { WifiOff, CheckCircle2, HardDrive, Smartphone, Download, X } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeDraftResponseId, setActiveDraftResponseId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(networkService.getStatus());
  const [pendingCount, setPendingCount] = useState(0);
  const [submitToast, setSubmitToast] = useState<{ title: string; message: string; isOffline: boolean } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallBannerDismissed, setIsInstallBannerDismissed] = useState(false);

  useEffect(() => {
    const unsubNet = networkService.subscribe((online) => setIsOnline(online));
    const unsubSync = syncManager.subscribe((state) => {
      setPendingCount(state.pendingCount);
    });

    const installHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', installHandler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      unsubNet();
      unsubSync();
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleStartSurvey = async (survey: Survey, draftResponseId?: string) => {
    try {
      const questions = await questionRepository.getBySurveyId(survey.id);
      setActiveSurvey(survey);
      setActiveQuestions(questions);
      setActiveDraftResponseId(draftResponseId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Không thể tải câu hỏi khảo sát:', err);
    }
  };

  const handleResumeDraft = async (surveyId: string, responseId: string) => {
    const survey = await surveyRepository.getById(surveyId);
    if (survey) {
      handleStartSurvey(survey, responseId);
    }
  };

  const handleSurveySubmitSuccess = (_response: SurveyResponse) => {
    const wasOffline = !networkService.getStatus();
    setActiveSurvey(null);
    setActiveQuestions([]);
    setActiveDraftResponseId(undefined);

    if (wasOffline) {
      setSubmitToast({
        title: 'Đã lưu trên thiết bị',
        message: 'Bạn đang offline. Câu trả lời đã được lưu và sẽ tự động đồng bộ khi có mạng.',
        isOffline: true,
      });
    } else {
      setSubmitToast({
        title: 'Đã lưu trên thiết bị',
        message: 'Đã đồng bộ dữ liệu lên Google Sheets.',
        isOffline: false,
      });
    }

    setCurrentTab('responses');

    setTimeout(() => {
      setSubmitToast(null);
    }, 6000);
  };

  return (
    <>
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Persistent Offline Warning Banner */}
      {!isOnline && (
        <div className="alert-banner offline">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WifiOff size={14} />
            <span>Offline — Dữ liệu đang được lưu an toàn trên thiết bị (IndexedDB).</span>
          </div>
        </div>
      )}

      {/* Submission Success / Offline Queued Toast Banner */}
      {submitToast && (
        <div className={`alert-banner ${submitToast.isOffline ? 'sync-pending' : 'sync-success'}`}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {submitToast.isOffline ? <HardDrive size={18} /> : <CheckCircle2 size={18} />}
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{submitToast.title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.95, marginTop: '2px' }}>{submitToast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Mobile Install Banner - Always visible until dismissed or installed */}
      {!isInstalled && !isInstallBannerDismissed && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.88rem',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)',
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} />
            <span>
              <strong>Cài đặt lên Android:</strong> Thêm StudyHabit vào màn hình chính để dùng offline mượt mà!
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => {
                if (deferredPrompt) {
                  handleInstallApp();
                } else {
                  setIsInstallModalOpen(true);
                }
              }}
              style={{
                background: 'white',
                color: '#0284c7',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              }}
            >
              <Download size={14} />
              Cài đặt ngay
            </button>
            <button
              onClick={() => setIsInstallBannerDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.85,
                padding: '4px',
              }}
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {activeSurvey ? (
          <MultiStepSurveyForm
            survey={activeSurvey}
            questions={activeQuestions}
            initialResponseId={activeDraftResponseId}
            onBack={() => {
              setActiveSurvey(null);
              setActiveQuestions([]);
              setActiveDraftResponseId(undefined);
            }}
            onSubmitSuccess={handleSurveySubmitSuccess}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardPage
                onStartSurvey={(s) => handleStartSurvey(s)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenInstall={() => setIsInstallModalOpen(true)}
              />
            )}

            {currentTab === 'surveys' && (
              <SurveyListPage
                onStartSurvey={(s) => handleStartSurvey(s)}
                onCreateSurveyClick={() => setCurrentTab('builder')}
              />
            )}

            {currentTab === 'responses' && (
              <ResponseHistoryPage
                onResumeDraft={(sId, rId) => handleResumeDraft(sId, rId)}
              />
            )}

            {currentTab === 'builder' && (
              <SurveyBuilderPage
                onSurveyPublished={(newSurvey) => {
                  setCurrentTab('surveys');
                  handleStartSurvey(newSurvey);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Tab Bar (hidden when actively answering a multi-step survey) */}
      {!activeSurvey && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          pendingCount={pendingCount}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Install PWA Guide Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onTriggerNativeInstall={handleInstallApp}
        canInstallNatively={!!deferredPrompt && !isInstalled}
      />
    </>
  );
}

export default App;
