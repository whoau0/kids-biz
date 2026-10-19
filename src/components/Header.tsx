import { ShoppingBag, Bell, RefreshCw, PlusCircle, Smartphone, Cloud, CloudOff } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'inventory' | 'calculator' | 'orders';
  setCurrentTab: (tab: 'dashboard' | 'inventory' | 'calculator' | 'orders') => void;
  onOpenSaleModal: () => void;
  onOpenProductModal: () => void;
  onResetData: () => void;
  alertCount: number;
  isFieldMode: boolean;
  onToggleFieldMode: () => void;
  isSupabaseConnected?: boolean;
  onSyncSupabase?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSaleModal,
  onOpenProductModal,
  onResetData,
  alertCount,
  isFieldMode,
  onToggleFieldMode,
  isSupabaseConnected = true,
  onSyncSupabase,
  isSyncing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-200/80 shadow-[0_1px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 & 타이틀 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-slateCustom-850 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              🧸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-850 font-sans">KIDS-BIZ</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-200/60">
                  아동복 온/오프라인
                </span>
                {/* Supabase 클라우드 연동 상태 뱃지 (PRD 5) */}
                <button
                  onClick={onSyncSupabase}
                  title="클릭 시 Supabase 클라우드 DB와 실시간 동기화"
                  className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                    isSupabaseConnected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <Cloud className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
                  <span>{isSyncing ? '동기화 중...' : 'Supabase 클라우드 연동됨'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">실시간 재고 · 세금 계산 · 야간 발주 자동화</p>
            </div>
          </div>

          {/* 데스크탑 네비게이션 탭 */}
          <nav className="hidden md:flex items-center gap-1.5 bg-brand-50/80 p-1.5 rounded-2xl border border-brand-200/80">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-brand-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              📊 대시보드
            </button>
            <button
              onClick={() => setCurrentTab('inventory')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'inventory'
                  ? 'bg-white text-brand-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              📦 재고 & 거래처
            </button>
            <button
              onClick={() => setCurrentTab('calculator')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'calculator'
                  ? 'bg-white text-brand-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              🧮 스마트 가격/세금
            </button>
            <button
              onClick={() => setCurrentTab('orders')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                currentTab === 'orders'
                  ? 'bg-white text-brand-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              🌙 판매 & 야간발주
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </nav>

          {/* 우측 빠른 액션 버튼들 */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 사입 이동 모드 토글 */}
            <button
              onClick={onToggleFieldMode}
              title={isFieldMode ? '일반 카운터 모드로 전환' : '사입 이동 현장 모드로 전환 (큰 글씨 & 터치 극대화)'}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isFieldMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFieldMode ? '사입 모드 ON' : '사입 모드'}</span>
            </button>

            <button
              onClick={onOpenSaleModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>판매 등록</span>
            </button>

            <button
              onClick={onOpenProductModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>상품 등록</span>
            </button>

            <button
              onClick={onResetData}
              title="초기 데이터 복원"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
