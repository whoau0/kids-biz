import React, { useState } from 'react';
import { X, ShoppingBag, Store, Globe, Check } from 'lucide-react';
import { 상품_테이블, 재고_테이블, 사이즈구분, 판매채널구분, 아동복_사이즈_라벨 } from '../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: 상품_테이블[];
  inventory: 재고_테이블[];
  onRecordSale: (saleData: {
    상품_아이디: string;
    판매채널: 판매채널구분;
    판매사이즈: 사이즈구분;
    판매수량: number;
    실제판매가: number;
  }) => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  products,
  inventory,
  onRecordSale,
}) => {
  if (!isOpen) return null;

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.아이디 || '');
  const [channel, setChannel] = useState<판매채널구분>('오프라인');
  const [selectedSize, setSelectedSize] = useState<사이즈구분>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  const selectedProduct = products.find(p => p.아이디 === selectedProductId);
  const currentInv = inventory.find(i => i.상품_아이디 === selectedProductId);

  const sizes: 사이즈구분[] = ['XS', 'S', 'M', 'L', 'XL'];
  const activePrice = customPrice !== null ? customPrice : (selectedProduct?.적정판매가 || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    onRecordSale({
      상품_아이디: selectedProductId,
      판매채널: channel,
      판매사이즈: selectedSize,
      판매수량: quantity,
      실제판매가: activePrice,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">빠른 판매 등록</h3>
              <p className="text-xs text-slate-400">판매 시 재고가 실시간 차감됩니다.</p>
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
          {/* 1. 상품 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              판매 상품 선택
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomPrice(null); // 초기화
              }}
              className="w-full text-xs sm:text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {products.map(p => (
                <option key={p.아이디} value={p.아이디}>
                  {p.상품명} ({p.도매처명})
                </option>
              ))}
            </select>
          </div>

          {/* 2. 판매 채널 선택 (온/오프라인) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              판매 채널
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel('오프라인')}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  channel === '오프라인'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4" />
                오프라인 (매장)
              </button>
              <button
                type="button"
                onClick={() => setChannel('온라인')}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  channel === '온라인'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                온라인 (쇼핑몰)
              </button>
            </div>
          </div>

          {/* 3. 판매 사이즈 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              판매 사이즈
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {sizes.map(s => {
                const stock = currentInv ? (currentInv[`사이즈_${s}` as keyof 재고_테이블] as number) : 0;
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-brand-700 bg-brand-700 text-white font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{s}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-brand-200' : 'text-slate-400'}`}>
                      {stock}장
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. 판매 수량 & 실제 판매가 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                판매 수량
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-center py-1.5 font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                건당 판매가 (원)
              </label>
              <input
                type="number"
                step="500"
                value={activePrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full py-1.5 px-3 font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 합계 미리보기 */}
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">총 결제 금액:</span>
            <span className="text-base font-extrabold text-brand-900">
              {(activePrice * quantity).toLocaleString()} 원
            </span>
          </div>

          {/* 서브밋 버튼 */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            판매 완료 및 재고 차감
          </button>
        </form>
      </div>
    </div>
  );
};
