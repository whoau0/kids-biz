import React, { useState, useEffect } from 'react';
import { X, Check, PackagePlus, Sparkles } from 'lucide-react';
import { 상품_테이블, 재고_테이블, 도매상태구분, 사이즈구분 } from '../types';
import { 스마트가격계산 } from '../utils/calculator';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: 상품_테이블 | null;
  onSaveProduct: (product: 상품_테이블, initialStock?: Record<사이즈구분, number>) => void;
  initialDraft?: Partial<상품_테이블> | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  initialDraft,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('상의');
  const [wholesaleName, setWholesaleName] = useState('남대문 부르뎅 (아랑)');
  const [wholesalePhone, setWholesalePhone] = useState('010-3847-2918');
  const [cost, setCost] = useState(15000);
  const [targetPrice, setTargetPrice] = useState(32000);
  const [maxDiscountPrice, setMaxDiscountPrice] = useState(21000);
  const [wholesaleStatus, setWholesaleStatus] = useState<도매상태구분>('교환가능');
  const [buyDate, setBuyDate] = useState('2026-10-19');

  // 초기 재고 설정 (신규 등록 시)
  const [stockXS, setStockXS] = useState(3);
  const [stockS, setStockS] = useState(3);
  const [stockM, setStockM] = useState(4);
  const [stockL, setStockL] = useState(3);
  const [stockXL, setStockXL] = useState(2);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.상품명);
      setCategory(productToEdit.카테고리);
      setWholesaleName(productToEdit.도매처명);
      setWholesalePhone(productToEdit.도매처연락처);
      setCost(productToEdit.도매원가);
      setTargetPrice(productToEdit.적정판매가);
      setMaxDiscountPrice(productToEdit.최대할인가);
      setWholesaleStatus(productToEdit.도매상태);
      setBuyDate(productToEdit.사입일자 || '2026-10-19');
    } else if (initialDraft) {
      if (initialDraft.도매원가) setCost(initialDraft.도매원가);
      if (initialDraft.적정판매가) setTargetPrice(initialDraft.적정판매가);
      if (initialDraft.최대할인가) setMaxDiscountPrice(initialDraft.최대할인가);
    }
  }, [productToEdit, initialDraft]);

  // 원가 변경 시 자동 스마트 가격 산출 기능
  const handleAutoCalcPrices = () => {
    const res = 스마트가격계산({
      도매원가: cost,
      수수료율: 5.5,
      배송비: 3000,
      목표마진율: 40,
      종합소득세율: 15,
      세금계산서발행여부: true,
    });
    setTargetPrice(res.적정판매가);
    setMaxDiscountPrice(res.마지노선판매가);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const productData: 상품_테이블 = {
      아이디: productToEdit ? productToEdit.아이디 : `prod-${Date.now()}`,
      상품명: name.trim(),
      카테고리: category,
      도매처명: wholesaleName.trim(),
      도매처연락처: wholesalePhone.trim(),
      도매원가: Number(cost),
      적정판매가: Number(targetPrice),
      최대할인가: Number(maxDiscountPrice),
      도매상태: wholesaleStatus,
      사입일자: buyDate,
      등록일시: productToEdit?.등록일시 || new Date().toISOString(),
    };

    const initialStock: Record<사이즈구분, number> = {
      XS: Number(stockXS),
      S: Number(stockS),
      M: Number(stockM),
      L: Number(stockL),
      XL: Number(stockXL),
    };

    onSaveProduct(productData, initialStock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-800 rounded-xl">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                {productToEdit ? '상품 정보 수정' : '신규 상품 등록'}
              </h3>
              <p className="text-xs text-slate-400">한글 데이터베이스 스키마와 100% 일치합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">상품명</label>
              <input
                type="text"
                required
                placeholder="예: 봉봉 소프트 피치 기모 맨투맨"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              >
                <option value="상의">상의</option>
                <option value="하의">하의</option>
                <option value="아우터">아우터</option>
                <option value="원피스/세트">원피스/세트</option>
                <option value="잡화/악세서리">잡화/악세서리</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">사입일자</label>
              <input
                type="date"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">도매처명 (상가 및 상호)</label>
              <input
                type="text"
                required
                placeholder="예: 남대문 부르뎅 (아랑)"
                value={wholesaleName}
                onChange={(e) => setWholesaleName(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">도매처 연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={wholesalePhone}
                onChange={(e) => setWholesalePhone(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* 도매 상태 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">도매 상태</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['교환가능', '주문가능', '도매품절', '교환불가'] as 도매상태구분[]).map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setWholesaleStatus(status)}
                  className={`py-1.5 text-xs rounded-xl font-semibold border text-center transition-all ${
                    wholesaleStatus === status
                      ? 'bg-brand-800 text-white border-brand-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 원가 및 판매가 (스마트 자동 계산 연동) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">가격 및 마진 설정</span>
              <button
                type="button"
                onClick={handleAutoCalcPrices}
                className="text-[11px] text-brand-700 hover:text-brand-900 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                스마트 자동 계산
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">도매원가 (원)</label>
                <input
                  type="number"
                  step="500"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full p-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-brand-700 mb-0.5">적정판매가 (원)</label>
                <input
                  type="number"
                  step="500"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full p-2 text-xs font-bold bg-white border border-brand-300 rounded-lg text-brand-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-rose-600 mb-0.5">최대할인가 (원)</label>
                <input
                  type="number"
                  step="500"
                  value={maxDiscountPrice}
                  onChange={(e) => setMaxDiscountPrice(Number(e.target.value))}
                  className="w-full p-2 text-xs font-bold bg-white border border-rose-300 rounded-lg text-rose-700"
                />
              </div>
            </div>
          </div>

          {/* 신규 상품 등록 시 초기 사이즈별 재고 */}
          {!productToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                초기 사이즈별 재고 수량 (장)
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">XS(5호)</span>
                  <input
                    type="number"
                    min="0"
                    value={stockXS}
                    onChange={(e) => setStockXS(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">S(7호)</span>
                  <input
                    type="number"
                    min="0"
                    value={stockS}
                    onChange={(e) => setStockS(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">M(9호)</span>
                  <input
                    type="number"
                    min="0"
                    value={stockM}
                    onChange={(e) => setStockM(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">L(11호)</span>
                  <input
                    type="number"
                    min="0"
                    value={stockL}
                    onChange={(e) => setStockL(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">XL(13호)</span>
                  <input
                    type="number"
                    min="0"
                    value={stockXL}
                    onChange={(e) => setStockXL(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-brand-800 hover:bg-brand-900 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Check className="w-4 h-4" />
            {productToEdit ? '상품 수정 완료' : '상품 및 재고 등록 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};
