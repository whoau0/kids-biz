import React, { useState, useMemo } from 'react';
import { 
  Calculator, DollarSign, Percent, TrendingUp, AlertCircle, 
  HelpCircle, ArrowRight, ShieldCheck, Check, Sparkles, PlusCircle 
} from 'lucide-react';
import { 스마트가격계산, 판매가_정밀분석, 계산기입력값 } from '../utils/calculator';
import { 상품_테이블 } from '../types';

interface PricingCalculatorProps {
  onApplyToNewProduct?: (productDraft: Partial<상품_테이블>) => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  onApplyToNewProduct,
}) => {
  // 계산기 상태
  const [wholesaleCost, setWholesaleCost] = useState<number>(15000);
  const [channelPreset, setChannelPreset] = useState<string>('smartstore');
  const [feeRate, setFeeRate] = useState<number>(5.5);
  const [shippingFee, setShippingFee] = useState<number>(3000);
  const [targetMargin, setTargetMargin] = useState<number>(40);
  const [incomeTaxRate, setIncomeTaxRate] = useState<number>(15);
  const [hasTaxInvoice, setHasTaxInvoice] = useState<boolean>(true);

  // 커스텀 판매가 시뮬레이션
  const [customPrice, setCustomPrice] = useState<number>(0);

  // 채널 프리셋 변경 핸들러
  const handlePresetChange = (preset: string) => {
    setChannelPreset(preset);
    switch (preset) {
      case 'smartstore':
        setFeeRate(5.5); // 네이버 스마트스토어
        break;
      case 'coupang':
        setFeeRate(10.8); // 쿠팡 윙
        break;
      case 'fashion_app':
        setFeeRate(13.0); // 에이블리/지그재그 패션플랫폼
        break;
      case 'offline_card':
        setFeeRate(1.5); // 오프라인 매장 카드결제
        setShippingFee(0);
        break;
      case 'offline_cash':
        setFeeRate(0.0); // 오프라인 현금
        setShippingFee(0);
        break;
      default:
        break;
    }
  };

  const inputParams: 계산기입력값 = useMemo(() => ({
    도매원가: wholesaleCost,
    수수료율: feeRate,
    배송비: shippingFee,
    목표마진율: targetMargin,
    종합소득세율: incomeTaxRate,
    세금계산서발행여부: hasTaxInvoice,
  }), [wholesaleCost, feeRate, shippingFee, targetMargin, incomeTaxRate, hasTaxInvoice]);

  // 스마트 계산 결과
  const calcResult = useMemo(() => {
    return 스마트가격계산(inputParams);
  }, [inputParams]);

  // 커스텀 판매가 분석 (기본은 적정판매가)
  const activePrice = customPrice > 0 ? customPrice : calcResult.적정판매가;
  const priceAnalysis = useMemo(() => {
    return 판매가_정밀분석(activePrice, inputParams);
  }, [activePrice, inputParams]);

  return (
    <div className="space-y-6">
      {/* 헤더 안내 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-700" />
              <span>스마트 가격 및 세금 계산기 (Smart Pricing)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              부가세(10%), 종합소득세 구간, 플랫폼 수수료를 실시간 공제하여 '목표 마진 달성가'와 '손실 없는 마지노선 최저가'를 산출합니다.
            </p>
          </div>

          {onApplyToNewProduct && (
            <button
              onClick={() => onApplyToNewProduct({
                도매원가: wholesaleCost,
                적정판매가: calcResult.적정판매가,
                최대할인가: calcResult.마지노선판매가,
              })}
              className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 active:scale-95 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              이 가격으로 상품 등록
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 파라미터 입력 폼 (5칸) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span>원가 및 세무 파라미터 설정</span>
          </h3>

          {/* 1. 도매 원가 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              도매 사입 원가 (원)
            </label>
            <div className="relative">
              <input
                type="number"
                step="500"
                value={wholesaleCost}
                onChange={(e) => setWholesaleCost(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[8000, 12000, 15000, 22000, 28000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWholesaleCost(val)}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                >
                  {val.toLocaleString()}원
                </button>
              ))}
            </div>
          </div>

          {/* 2. 판매 채널 프리셋 & 수수료율 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              판매 채널 및 플랫폼 수수료율
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => handlePresetChange('smartstore')}
                className={`p-2 text-xs rounded-xl font-medium border text-center transition-all ${
                  channelPreset === 'smartstore' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                스마트스토어 (5.5%)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('coupang')}
                className={`p-2 text-xs rounded-xl font-medium border text-center transition-all ${
                  channelPreset === 'coupang' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                쿠팡 윙 (10.8%)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('fashion_app')}
                className={`p-2 text-xs rounded-xl font-medium border text-center transition-all ${
                  channelPreset === 'fashion_app' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                에이블리 (13%)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('offline_card')}
                className={`p-2 text-xs rounded-xl font-medium border text-center transition-all ${
                  channelPreset === 'offline_card' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                오프라인 카드 (1.5%)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('offline_cash')}
                className={`p-2 text-xs rounded-xl font-medium border text-center transition-all ${
                  channelPreset === 'offline_cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                오프라인 현금 (0%)
              </button>
              <button
                type="button"
                onClick={() => setChannelPreset('custom')}
                className={`p-2 text-xs rounded-xl font-medium border text-center transition-all ${
                  channelPreset === 'custom' ? 'border-slate-700 bg-slate-100 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                직접 입력
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={feeRate}
                onChange={(e) => {
                  setFeeRate(Number(e.target.value));
                  setChannelPreset('custom');
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">% 수수료</span>
            </div>
          </div>

          {/* 3. 판매자 부담 배송비 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              판매자 부담 배송비 (원)
            </label>
            <div className="relative">
              <input
                type="number"
                step="500"
                value={shippingFee}
                onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
            </div>
            <div className="flex gap-1.5 mt-1.5 text-[11px] text-slate-400">
              <span>* 무료배송 프로모션 진행 시 3,000원 입력, 매장 판매 시 0원</span>
            </div>
          </div>

          {/* 4. 목표 마진율 */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                목표 순마진율: <strong className="text-brand-800 text-sm">{targetMargin}%</strong>
              </label>
              <span className="text-[11px] text-slate-400">의류 권장 35~50%</span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full accent-brand-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20% (박리다매)</span>
              <span>40% (표준)</span>
              <span>70% (고마진 프리미엄)</span>
            </div>
          </div>

          {/* 5. 종합소득세율 및 매입세액 공제 여부 */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                예상 종합소득세 과세표준 구간
              </label>
              <select
                value={incomeTaxRate}
                onChange={(e) => setIncomeTaxRate(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={6}>1,400만원 이하 (세율 6%)</option>
                <option value={15}>1,400만원 초과 ~ 5,000만원 이하 (세율 15% - 기본)</option>
                <option value={24}>5,000만원 초과 ~ 8,800만원 이하 (세율 24%)</option>
                <option value={35}>8,800만원 초과 ~ 1억 5천만원 이하 (세율 35%)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">도매 사입 세금계산서 발행</span>
                <span className="text-[11px] text-slate-400">매입부가세 10% 공제 반영</span>
              </div>
              <input
                type="checkbox"
                checked={hasTaxInvoice}
                onChange={(e) => setHasTaxInvoice(e.target.checked)}
                className="w-4 h-4 accent-brand-700 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 우측: 계산 결과 및 실시간 마진 시뮬레이터 (7칸) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. 추천 가격 카드 (적정 판매가 vs 마지노선 최저가) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 적정 판매가 (목표 마진 달성) */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                  목표 순마진 {targetMargin}% 달성
                </span>
                <Sparkles className="w-4 h-4 text-brand-200" />
              </div>
              <div className="text-sm font-medium text-brand-100">추천 적정 판매가</div>
              <div className="text-3xl font-extrabold mt-1 tracking-tight">
                {calcResult.적정판매가.toLocaleString()}
                <span className="text-lg font-normal ml-1">원</span>
              </div>
              <div className="mt-3 text-xs text-brand-100 border-t border-white/20 pt-2.5 flex justify-between">
                <span>실제 순이익: <strong>{calcResult.실제예상순이익.toLocaleString()}원</strong></span>
                <span>실마진: <strong>{calcResult.실제순익률}%</strong></span>
              </div>
            </div>

            {/* 최대 할인 금액 (마지노선 판매가) */}
            <div className="bg-white border-2 border-rose-300 rounded-2xl p-5 shadow-2xs relative">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  손익분기점 (BEP)
                </span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-sm font-semibold text-slate-600">마지노선 최저 판매가</div>
              <div className="text-3xl font-extrabold mt-1 text-rose-600 tracking-tight">
                {calcResult.마지노선판매가.toLocaleString()}
                <span className="text-lg font-normal text-slate-600 ml-1">원</span>
              </div>
              <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                이 금액 이하로 판매 시 <strong>세금·수수료로 인한 적자</strong>가 발생합니다.
              </div>
            </div>
          </div>

          {/* 2. 세무/수수료 상세 분해표 (PRD 3.3 핵심) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                판매금액 기준 세무 & 마진 정밀 분해표
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>기준가:</span>
                <input
                  type="number"
                  step="500"
                  value={activePrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-right font-bold text-slate-800 bg-slate-100 rounded-lg border border-slate-200"
                />
                <span>원</span>
              </div>
            </div>

            {/* 워터폴 다이어그램 형태의 내역 */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl font-bold text-slate-800">
                <span>소비자 결제 판매가 (A)</span>
                <span>{priceAnalysis.판매가.toLocaleString()} 원</span>
              </div>

              <div className="pl-3 space-y-1 text-slate-600">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>└ 공급가액</span>
                  <span>{priceAnalysis.공급가액.toLocaleString()} 원</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>└ 매출 부가세 (10%)</span>
                  <span>{priceAnalysis.매출부가세.toLocaleString()} 원</span>
                </div>
              </div>

              {/* 차감 항목들 */}
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2 text-slate-700">
                <div className="text-[11px] font-bold text-rose-800 uppercase">공제 및 비용 항목 (B)</div>

                <div className="flex justify-between">
                  <span>• 도매 사입 원가</span>
                  <span className="font-semibold text-rose-600">-{wholesaleCost.toLocaleString()} 원</span>
                </div>

                <div className="flex justify-between">
                  <span>• 플랫폼 판매 수수료 ({feeRate}%)</span>
                  <span className="font-semibold text-rose-600">-{priceAnalysis.플랫폼수수료.toLocaleString()} 원</span>
                </div>

                {shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>• 판매자 부담 배송비</span>
                    <span className="font-semibold text-rose-600">-{shippingFee.toLocaleString()} 원</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>• 실 납부 부가세 (매출세액 - 매입공제 {priceAnalysis.매입부가세공제.toLocaleString()}원)</span>
                  <span className="font-semibold text-rose-600">-{priceAnalysis.실납부부가세.toLocaleString()} 원</span>
                </div>

                <div className="flex justify-between">
                  <span>• 종합소득세 예상액 ({incomeTaxRate}%)</span>
                  <span className="font-semibold text-rose-600">-{priceAnalysis.예상종합소득세.toLocaleString()} 원</span>
                </div>
              </div>

              {/* 최종 정산 */}
              <div className="flex justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-bold text-sm">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>실제 손에 쥐는 순수익 (A - B)</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-extrabold text-base">
                    {priceAnalysis.실제예상순이익.toLocaleString()} 원
                  </span>
                  <span className="text-xs text-emerald-600 ml-1.5">
                    ({priceAnalysis.실제순익률}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
              * <strong>의류 사입 판매자 실무 팁</strong>: 세금계산서 수취 여부에 따라 건당 약 {(Math.round(wholesaleCost / 1.1 * 0.1)).toLocaleString()}원의 부가세 매입세액 공제 차이가 발생합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
