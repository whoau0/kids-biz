import React from 'react';
import { LayoutDashboard, Boxes, Calculator, Moon, Plus } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'dashboard' | 'inventory' | 'calculator' | 'orders';
  setCurrentTab: (tab: 'dashboard' | 'inventory' | 'calculator' | 'orders') => void;
  onOpenSaleModal: () => void;
  alertCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSaleModal,
  alertCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around relative">
        {/* 대시보드 */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'dashboard' ? 'bg-brand-100' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">대시보드</span>
        </button>

        {/* 재고 & 거래처 */}
        <button
          onClick={() => setCurrentTab('inventory')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'inventory' ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'inventory' ? 'bg-brand-100' : ''}`}>
            <Boxes className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">재고/거래처</span>
        </button>

        {/* 중앙 플로팅 빠른 판매 등록 버튼 (사입 이동 중 원터치) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onOpenSaleModal}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
            aria-label="빠른 판매 등록"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-emerald-800 mt-0.5">판매등록</span>
        </div>

        {/* 스마트 가격/세금 계산기 */}
        <button
          onClick={() => setCurrentTab('calculator')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'calculator' ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'calculator' ? 'bg-brand-100' : ''}`}>
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">세금/가격</span>
        </button>

        {/* 야간 발주 */}
        <button
          onClick={() => setCurrentTab('orders')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            currentTab === 'orders' ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-lg relative ${currentTab === 'orders' ? 'bg-brand-100' : ''}`}>
            <Moon className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">야간발주</span>
        </button>
      </div>
    </nav>
  );
};
