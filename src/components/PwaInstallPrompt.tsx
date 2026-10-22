import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('kids_biz_pwa_prompt_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if already in standalone (installed PWA) mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isAppleDevice);

    // Listen for Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Do not show if already running in standalone app mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  // If no install prompt available and not on iOS, do not show
  if (!deferredPrompt && !isIos) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('kids_biz_pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* PWA 설치 유도 플로팅 배너 */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slateCustom-850 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-base">
            🧸
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>KIDS-BIZ 앱으로 설치하기</span>
              <span className="text-[10px] bg-brand-500/40 text-brand-100 px-1.5 py-0.2 rounded font-medium">독립실행</span>
            </div>
            <p className="text-[11px] text-brand-200/90 hidden sm:block">
              주소창과 브라우저 툴바를 숨기고 스마트폰 앱처럼 깔끔하게 사용하세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all"
          >
            {isIos ? (
              <>
                <Share className="w-3.5 h-3.5" />
                <span>홈 화면에 추가</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>앱 설치</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS 홈 화면 추가 안내 모달 */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white text-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-700 to-slateCustom-850 flex items-center justify-center text-white text-2xl shadow-sm">
                🧸
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">홈 화면에 KIDS-BIZ 추가</h3>
                <p className="text-xs text-slate-500">iPhone / iPad 모바일 앱 실행 가이드</p>
              </div>
            </div>

            <div className="space-y-3 my-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  Safari 브라우저 하단의 <strong className="text-slate-900 inline-flex items-center gap-1 mx-0.5"><Share className="w-3.5 h-3.5" />공유 버튼</strong>을 누릅니다.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  메뉴를 아래로 스크롤하여 <strong className="text-slate-900 inline-flex items-center gap-1 mx-0.5"><PlusSquare className="w-3.5 h-3.5" />홈 화면에 추가</strong>를 선택합니다.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  우측 상단 <strong>[추가]</strong>를 누르면 바탕화면에 주소창 없는 독립 앱 아이콘이 생성됩니다.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 bg-brand-900 hover:bg-brand-950 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
};
