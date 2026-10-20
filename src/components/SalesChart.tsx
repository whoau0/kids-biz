import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Calendar, TrendingUp, Globe, Store, 
  ChevronRight, ArrowUpRight, Filter
} from 'lucide-react';
import { 판매_테이블 } from '../types';

export type ChartPeriod = 'daily' | 'monthly' | 'yearly';

interface SalesChartProps {
  sales: 판매_테이블[];
  currentDate?: string; // 기본값 '2026-10-19'
}

interface PeriodDataPoint {
  key: string;       // YYYY-MM-DD, YYYY-MM, or YYYY
  label: string;     // 화면 표시 라벨 (예: '10/19(오늘)', '10월', '2026년')
  onlineAmount: number;
  offlineAmount: number;
  totalAmount: number;
  onlineCount: number;
  offlineCount: number;
  isToday?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  sales,
  currentDate = '2026-10-19',
}) => {
  const [period, setPeriod] = useState<ChartPeriod>('daily');
  const [hoveredPoint, setHoveredPoint] = useState<PeriodDataPoint | null>(null);

  // 기간별 집계 데이터 계산
  const chartData = useMemo(() => {
    if (period === 'daily') {
      // 최근 7일 (2026-10-13 ~ 2026-10-19)
      const days: PeriodDataPoint[] = [];
      const baseDate = new Date(currentDate);

      for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const monthDay = `${d.getMonth() + 1}/${d.getDate()}`;
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[d.getDay()];

        const daySales = sales.filter(s => s.판매일시.startsWith(dateStr));
        const onlineSales = daySales.filter(s => s.판매채널 === '온라인');
        const offlineSales = daySales.filter(s => s.판매채널 === '오프라인');

        const onlineAmount = onlineSales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);
        const offlineAmount = offlineSales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);

        days.push({
          key: dateStr,
          label: i === 0 ? `${monthDay}(오늘)` : `${monthDay}(${dayName})`,
          onlineAmount,
          offlineAmount,
          totalAmount: onlineAmount + offlineAmount,
          onlineCount: onlineSales.reduce((sum, s) => sum + s.판매수량, 0),
          offlineCount: offlineSales.reduce((sum, s) => sum + s.판매수량, 0),
          isToday: i === 0,
        });
      }
      return days;
    } else if (period === 'monthly') {
      // 최근 6개월 (2026-05 ~ 2026-10)
      const months: PeriodDataPoint[] = [];
      const monthKeys = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

      monthKeys.forEach(mKey => {
        const mSales = sales.filter(s => s.판매일시.startsWith(mKey));
        const onlineSales = mSales.filter(s => s.판매채널 === '온라인');
        const offlineSales = mSales.filter(s => s.판매채널 === '오프라인');

        const onlineAmount = onlineSales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);
        const offlineAmount = offlineSales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);

        const monthNumber = parseInt(mKey.split('-')[1], 10);

        months.push({
          key: mKey,
          label: `${monthNumber}월${mKey === '2026-10' ? '(당월)' : ''}`,
          onlineAmount,
          offlineAmount,
          totalAmount: onlineAmount + offlineAmount,
          onlineCount: onlineSales.reduce((sum, s) => sum + s.판매수량, 0),
          offlineCount: offlineSales.reduce((sum, s) => sum + s.판매수량, 0),
          isToday: mKey === '2026-10',
        });
      });
      return months;
    } else {
      // 연도별 (2024, 2025, 2026)
      const years: PeriodDataPoint[] = [];
      const yearKeys = ['2024', '2025', '2026'];

      yearKeys.forEach(yKey => {
        const ySales = sales.filter(s => s.판매일시.startsWith(yKey));
        const onlineSales = ySales.filter(s => s.판매채널 === '온라인');
        const offlineSales = ySales.filter(s => s.판매채널 === '오프라인');

        const onlineAmount = onlineSales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);
        const offlineAmount = offlineSales.reduce((sum, s) => sum + s.실제판매가 * s.판매수량, 0);

        years.push({
          key: yKey,
          label: `${yKey}년${yKey === '2026' ? '(올해)' : ''}`,
          onlineAmount,
          offlineAmount,
          totalAmount: onlineAmount + offlineAmount,
          onlineCount: onlineSales.reduce((sum, s) => sum + s.판매수량, 0),
          offlineCount: offlineSales.reduce((sum, s) => sum + s.판매수량, 0),
          isToday: yKey === '2026',
        });
      });
      return years;
    }
  }, [sales, period, currentDate]);

  // 선택된 기간 전체 요약
  const summary = useMemo(() => {
    const totalOnline = chartData.reduce((sum, d) => sum + d.onlineAmount, 0);
    const totalOffline = chartData.reduce((sum, d) => sum + d.offlineAmount, 0);
    const grandTotal = totalOnline + totalOffline;
    const onlineRate = grandTotal > 0 ? Number(((totalOnline / grandTotal) * 100).toFixed(1)) : 0;
    const offlineRate = grandTotal > 0 ? Number(((totalOffline / grandTotal) * 100).toFixed(1)) : 0;

    // 최대 매출 지점 (차트 높이 기준용)
    const maxBarValue = Math.max(...chartData.map(d => Math.max(d.onlineAmount, d.offlineAmount)), 100000);

    return {
      totalOnline,
      totalOffline,
      grandTotal,
      onlineRate,
      offlineRate,
      maxBarValue,
    };
  }, [chartData]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
      {/* 1. 상단 컨트롤: 타이틀 & 기간 선택 탭 (일자별 / 월별 / 연도별) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-100 text-brand-800 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              온·오프라인 매출 비교 분석 차트
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            일자별 · 월별 · 연도별 판매 추이를 한눈에 비교하고 채널별 비중을 분석합니다.
          </p>
        </div>

        {/* 기간 선택 토글 버튼 (일자별 / 월별 / 연도별) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            일자별 (최근 7일)
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            월별 (최근 6개월)
          </button>
          <button
            type="button"
            onClick={() => setPeriod('yearly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'yearly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            연도별 (최근 3개년)
          </button>
        </div>
      </div>

      {/* 2. 기간 요약 수치 & 범례 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">
            {period === 'daily' ? '최근 7일' : period === 'monthly' ? '최근 6개월' : '최근 3개년'} 총 매출 합계
          </span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
            {summary.grandTotal.toLocaleString()} <span className="text-xs font-normal">원</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-blue-600 shrink-0"></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">온라인 쇼핑몰</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                {summary.onlineRate}%
              </span>
            </div>
            <div className="font-extrabold text-blue-900 text-sm">
              {summary.totalOnline.toLocaleString()} 원
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-emerald-600 shrink-0"></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">오프라인 매장</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                {summary.offlineRate}%
              </span>
            </div>
            <div className="font-extrabold text-emerald-900 text-sm">
              {summary.totalOffline.toLocaleString()} 원
            </div>
          </div>
        </div>
      </div>

      {/* 3. 인터랙티브 듀얼 막대(Grouped Bar) 그래프 */}
      <div className="pt-2">
        {/* 그래프 영역 */}
        <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 pb-2 border-b border-slate-200">
          {chartData.map((d, index) => {
            // 막대 높이 비율 계산 (최대 180px 기준)
            const maxVal = summary.maxBarValue;
            const onlineHeight = Math.max(8, Math.round((d.onlineAmount / maxVal) * 160));
            const offlineHeight = Math.max(8, Math.round((d.offlineAmount / maxVal) * 160));

            const isHovered = hoveredPoint?.key === d.key;

            return (
              <div
                key={d.key}
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
                className={`flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group transition-all ${
                  d.isToday ? 'bg-amber-50/40 rounded-xl p-1 -m-1' : ''
                }`}
              >
                {/* 호버 시 툴팁 */}
                {isHovered && (
                  <div className="absolute -top-24 z-30 bg-slateCustom-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-[11px] text-brand-200 flex items-center justify-between gap-3">
                      <span>{d.label}</span>
                      <span>합계: {d.totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-blue-300">
                      <span>온라인 ({d.onlineCount}건):</span>
                      <span className="font-bold">{d.onlineAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-emerald-300">
                      <span>오프라인 ({d.offlineCount}건):</span>
                      <span className="font-bold">{d.offlineAmount.toLocaleString()}원</span>
                    </div>
                  </div>
                )}

                {/* 오늘 뱃지 표시 */}
                {d.isToday && (
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full mb-1 animate-pulse">
                    오늘
                  </span>
                )}

                {/* 듀얼 바 그룹 (온라인 vs 오프라인) */}
                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center">
                  {/* 온라인 막대 (블루) */}
                  <div
                    style={{ height: `${onlineHeight}px` }}
                    className={`w-3 sm:w-5 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-2xs ${
                      d.onlineAmount === 0 ? 'opacity-20' : 'opacity-90 group-hover:opacity-100'
                    }`}
                    title={`온라인: ${d.onlineAmount.toLocaleString()}원`}
                  ></div>

                  {/* 오프라인 막대 (에메랄드) */}
                  <div
                    style={{ height: `${offlineHeight}px` }}
                    className={`w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-2xs ${
                      d.offlineAmount === 0 ? 'opacity-20' : 'opacity-90 group-hover:opacity-100'
                    }`}
                    title={`오프라인: ${d.offlineAmount.toLocaleString()}원`}
                  ></div>
                </div>

                {/* 상단 금액 간이 표시 (큰 화면) */}
                <span className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-full hidden md:block">
                  {(d.totalAmount / 10000).toFixed(0)}만
                </span>
              </div>
            );
          })}
        </div>

        {/* X축 라벨 */}
        <div className="flex justify-between items-center px-2 sm:px-4 pt-2 text-[11px] sm:text-xs text-slate-500 font-medium">
          {chartData.map(d => (
            <div
              key={d.key}
              className={`flex-1 text-center truncate ${
                d.isToday ? 'font-bold text-amber-800' : ''
              }`}
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* 4. 하단 채널 비중 바 & 인터랙티브 안내 */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>채널별 비중:</span>
          <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${summary.onlineRate}%` }}
            ></div>
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${summary.offlineRate}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-semibold text-slate-700">
            온라인 {summary.onlineRate}% : 오프라인 {summary.offlineRate}%
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          * 막대에 마우스를 올리면 각 채널의 상세 금액과 판매 건수를 확인할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
