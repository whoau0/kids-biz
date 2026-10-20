import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PackageCheck, AlertCircle, 
  ArrowUpRight, Clock, ShieldCheck, ShoppingCart, Sparkles, Building2, ChevronRight
} from 'lucide-react';
import { 상품_테이블, 재고_테이블, 판매_테이블, 발주_테이블 } from '../types';
import { SalesChart } from './SalesChart';

interface DashboardProps {
  products: 상품_테이블[];
  inventory: 재고_테이블[];
  sales: 판매_테이블[];
  orders: 발주_테이블[];
  onNavigateTab: (tab: 'dashboard' | 'inventory' | 'calculator' | 'orders') => void;
  onOpenSaleModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  inventory,
  sales,
  orders,
  onNavigateTab,
  onOpenSaleModal,
}) => {
  const todayStr = '2026-10-19'; // 데모 기준 오늘 날짜 (2026-10-19)
  const yesterdayStr = '2026-10-18';

  // 1. 오늘의 매출 계산
  const todaySales = sales.filter(s => s.판매일시.startsWith(todayStr));
  const yesterdaySales = sales.filter(s => s.판매일시.startsWith(yesterdayStr));

  const onlineToday = todaySales.filter(s => s.판매채널 === '온라인');
  const offlineToday = todaySales.filter(s => s.판매채널 === '오프라인');

  const onlineAmount = onlineToday.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);
  const offlineAmount = offlineToday.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);
  const totalTodayRevenue = onlineAmount + offlineAmount;
  const totalTodayCount = todaySales.reduce((sum, s) => sum + s.판매수량, 0);

  const yesterdayAmount = yesterdaySales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);
  const revenueGrowthRate = yesterdayAmount > 0 
    ? Number((((totalTodayRevenue - yesterdayAmount) / yesterdayAmount) * 100).toFixed(1))
    : 100;

  // 2. 실시간 예상 순수익 계산 (오늘 판매 건 기준)
  // 판매건별 원가, 수수료 (온라인 평균 8%, 오프라인 1.5%), 부가세 및 종합소득세 차감
  let totalCost = 0;
  let totalFee = 0;
  let totalVat = 0;

  todaySales.forEach(s => {
    const prod = products.find(p => p.아이디 === s.상품_아이디);
    const itemRev = s.실제판매가 * s.판매수량;
    const itemCost = (prod?.도매원가 || 0) * s.판매수량;
    totalCost += itemCost;

    // 수수료 (온라인 8%, 오프라인 1.5% 평균)
    const feeRate = s.판매채널 === '온라인' ? 0.08 : 0.015;
    totalFee += Math.round(itemRev * feeRate);

    // 부가세: (매출/1.1 * 0.1) - (원가/1.1 * 0.1)
    const salesVat = Math.round((itemRev / 1.1) * 0.1);
    const costVat = Math.round((itemCost / 1.1) * 0.1);
    totalVat += Math.max(0, salesVat - costVat);
  });

  const estimatedOperatingIncome = totalTodayRevenue - totalCost - totalFee - totalVat;
  // 종합소득세 (15% 과세표준 구간 가정)
  const estimatedIncomeTax = estimatedOperatingIncome > 0 ? Math.round(estimatedOperatingIncome * 0.15) : 0;
  const netProfit = Math.max(0, estimatedOperatingIncome - estimatedIncomeTax);
  const netProfitRate = totalTodayRevenue > 0 ? Number(((netProfit / totalTodayRevenue) * 100).toFixed(1)) : 0;

  // 3. 총 보유 재고 가치 (원가 기준)
  let totalInventoryValue = 0;
  let totalInventoryCount = 0;

  inventory.forEach(inv => {
    const prod = products.find(p => p.아이디 === inv.상품_아이디);
    const cost = prod?.도매원가 || 0;
    const count = inv.사이즈_XS + inv.사이즈_S + inv.사이즈_M + inv.사이즈_L + inv.사이즈_XL;
    totalInventoryCount += count;
    totalInventoryValue += count * cost;
  });

  // 4. 미처리 발주 및 교환 알림
  const pendingOrders = orders.filter(o => o.발주상태 === '대기중');
  const pendingOrderItemsCount = pendingOrders.reduce((sum, o) => sum + o.발주품목내역.length, 0);

  // 교환 임박 품목 (사입일로부터 14일 교환 규정 기준, 잔여일 3일 이하이면서 상태가 '교환가능'인 상품)
  const exchangeUrgentProducts = products.filter(p => {
    if (p.도매상태 !== '교환가능' || !p.사입일자) return false;
    const buyDate = new Date(p.사입일자);
    const today = new Date(todayStr);
    const diffDays = Math.floor((today.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 11 && diffDays <= 14; // 14일 기한 중 11일 이상 경과(3일 이내 임박)
  });

  return (
    <div className="space-y-6">
      {/* 상단 웰컴 & 시장 동향 배너 */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-slateCustom-850 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium backdrop-blur-xs">
                남대문 · 동대문 실시간 사입 관리
              </span>
              <span className="text-xs text-brand-200">기준일자: {todayStr}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              오늘 매장 현황 브리핑
            </h1>
            <p className="text-sm text-brand-100 mt-1">
              오늘 총 <strong className="text-emerald-300">{totalTodayCount}건</strong>의 판매가 발생했으며, 
              실제 손에 쥐는 예상 순이익은 <strong className="text-emerald-300">{netProfit.toLocaleString()}원</strong>({netProfitRate}%)입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenSaleModal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              오늘 판매 등록
            </button>
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 border border-white/20"
            >
              야간 발주서 확인
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 배경 은은한 데코 */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 4대 핵심 메트릭 카드 (PRD 3.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 오늘의 총 매출 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-sm font-medium">오늘의 총 매출</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalTodayRevenue.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-600">원</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className={`inline-flex items-center font-semibold ${
              revenueGrowthRate >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {revenueGrowthRate >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {revenueGrowthRate >= 0 ? `+${revenueGrowthRate}%` : `${revenueGrowthRate}%`}
            </span>
            <span className="text-slate-400">전일 ({yesterdayAmount.toLocaleString()}원) 대비</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 text-[11px] text-slate-500">
              <div>
                <span className="block text-slate-400">온라인 ({onlineToday.length}건)</span>
                <span className="font-bold text-blue-700">{onlineAmount.toLocaleString()}원</span>
              </div>
              <div className="text-right">
                <span className="block text-slate-400">오프라인 ({offlineToday.length}건)</span>
                <span className="font-bold text-emerald-700">{offlineAmount.toLocaleString()}원</span>
              </div>
            </div>
            {/* 오늘의 온/오프라인 미니 비중 게이지 바 */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${totalTodayRevenue > 0 ? (onlineAmount / totalTodayRevenue) * 100 : 50}%` }}
              ></div>
              <div 
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${totalTodayRevenue > 0 ? (offlineAmount / totalTodayRevenue) * 100 : 50}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 2. 실시간 예상 순수익 (세금/수수료 제외) */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">실시간 예상 순수익</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                세후
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">
              {netProfit.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-emerald-600">원</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-600">
              실질 마진율: {netProfitRate}%
            </span>
            <span className="text-slate-400">원가/세금/수수료 공제</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>수수료: {totalFee.toLocaleString()}원</span>
            <span>부가·소득세: {(totalVat + estimatedIncomeTax).toLocaleString()}원</span>
          </div>
        </div>

        {/* 3. 총 보유 재고 가치 (원가 기준) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-sm font-medium">총 보유 재고 가치</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalInventoryValue.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-600">원</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              현재 보유 수량: <strong className="text-slate-800">{totalInventoryCount}</strong>장
            </span>
            <span className="text-slate-400">사입 원가 기준</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>관리 품목: {products.length}종</span>
            <button 
              onClick={() => onNavigateTab('inventory')}
              className="text-brand-600 hover:text-brand-800 font-medium flex items-center gap-0.5"
            >
              재고 상세 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4. 미처리 발주/교환 알림 */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-sm font-medium">미처리 발주 / 교환 알림</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600 tracking-tight">
              {pendingOrderItemsCount + exchangeUrgentProducts.length}
            </span>
            <span className="text-sm font-semibold text-rose-500">건 필요</span>
          </div>

          <div className="mt-2.5 text-xs text-slate-500 flex items-center justify-between">
            <span>야간 대기 발주: <strong className="text-rose-600">{pendingOrderItemsCount}</strong>품목</span>
            <span>교환 임박: <strong className="text-amber-600">{exchangeUrgentProducts.length}</strong>종</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] flex justify-between items-center">
            <span className="text-rose-600 font-semibold">도매처 마감 전 확인</span>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-brand-700 hover:underline font-semibold flex items-center"
            >
              발주서 바로가기
            </button>
          </div>
        </div>
      </div>

      {/* 2열 레이아웃: AI 알림 & 채널별 분석 vs 최근 판매 내역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2칸: 발주/교환 현황 & 온오프라인 채널 비중 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 교환 임박 경고 배너 (실무 남대문/동대문 핵심 페인포인트) */}
          {exchangeUrgentProducts.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-900">
                    ⚠️ 도매처 교환 가능 기한(14일) 임박 상품 발생
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold">
                    D-2 임박
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  남대문 부르뎅 <strong>'{exchangeUrgentProducts[0].상품명}'</strong>의 사입일({exchangeUrgentProducts[0].사입일자})로부터 12일이 경과했습니다.
                  미판매 사이즈를 도매처에 교환 요청하거나, 스마트 계산기로 마지노선 할인가를 적용해 조기 소진하세요.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab('inventory')}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    재고 현황 확인 및 교환 처리
                  </button>
                  <button
                    onClick={() => onNavigateTab('calculator')}
                    className="text-xs bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    최대할인가 산출하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 온·오프라인 매출 비교 인터랙티브 차트 (일자별 / 월별 / 연도별) */}
          <SalesChart sales={sales} currentDate={todayStr} />

          {/* 도매처별 사입 비중 미니 요약 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>주요 거래 도매처별 보유 재고 현황</span>
              </span>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-[11px] text-brand-700 hover:text-brand-900 font-semibold flex items-center"
              >
                전체 재고 보기 →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="font-bold text-slate-800 truncate">남대문 부르뎅 (아랑)</div>
                <div className="text-slate-400 text-[11px] mt-1 flex justify-between">
                  <span>보유 재고:</span>
                  <strong className="text-slate-700">35장</strong>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="font-bold text-slate-800 truncate">동대문 혜양 (코코베베)</div>
                <div className="text-slate-400 text-[11px] mt-1 flex justify-between">
                  <span>보유 재고:</span>
                  <strong className="text-slate-700">12장</strong>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs col-span-2 sm:col-span-1">
                <div className="font-bold text-slate-800 truncate">남대문 포키 (쁘띠앙)</div>
                <div className="text-slate-400 text-[11px] mt-1 flex justify-between">
                  <span>보유 재고:</span>
                  <strong className="text-slate-700">50장</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 1칸: 실시간 당일 판매 피드 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>오늘 실시간 판매 내역</span>
              <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full font-semibold">
                {todaySales.length}건
              </span>
            </h3>
            <button
              onClick={onOpenSaleModal}
              className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
            >
              + 추가
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {todaySales.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                오늘 등록된 판매 내역이 없습니다.
              </div>
            ) : (
              todaySales.map((sale) => {
                const prod = products.find(p => p.아이디 === sale.상품_아이디);
                const timeStr = sale.판매일시.split('T')[1]?.slice(0, 5) || '';
                return (
                  <div
                    key={sale.아이디}
                    className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          sale.판매채널 === '온라인' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {sale.판매채널}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                          {prod?.상품명 || '상품'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>사이즈: <strong>{sale.판매사이즈}호</strong></span>
                        <span>수량: <strong>{sale.판매수량}장</strong></span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">
                        {(sale.실제판매가 * sale.판매수량).toLocaleString()}원
                      </div>
                      <div className="text-[10px] text-slate-400">
                        @ {sale.실제판매가.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-brand-700 hover:text-brand-900 font-semibold"
            >
              오늘 판매 기반 자동 야간 발주서 보기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
