import React, { useState } from 'react';
import { AlertCircle, ShoppingCart, X, Plus, Check } from 'lucide-react';
import { 상품_테이블, 사이즈구분 } from '../types';

interface ReorderPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: 상품_테이블 | null;
  size: 사이즈구분;
  remainingStock: number;
  onConfirmReorder: (productId: string, size: 사이즈구분, quantity: number, memo?: string) => void;
}

export const ReorderPromptModal: React.FC<ReorderPromptModalProps> = ({
  isOpen,
  onClose,
  product,
  size,
  remainingStock,
  onConfirmReorder,
}) => {
  if (!isOpen || !product) return null;

  const [orderQty, setOrderQty] = useState<number>(3);
  const [memo, setMemo] = useState<string>('품절 리오더');

  const handleConfirm = () => {
    onConfirmReorder(product.아이디, size, orderQty, memo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">품절 / 품절 임박 감지</h3>
              <p className="text-[11px] text-slate-400">잔여 수량이 1개 이하입니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">상품명:</span>
            <span className="font-bold text-slate-800">{product.상품명}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">사이즈:</span>
            <span className="font-bold text-brand-800">{size}호</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">도매처:</span>
            <span className="font-semibold text-slate-700">{product.도매처명}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-amber-200">
            <span className="text-amber-900 font-medium">잔여 재고:</span>
            <span className={`font-extrabold ${remainingStock === 0 ? 'text-rose-600' : 'text-amber-700'}`}>
              {remainingStock === 0 ? '0장 (완전 품절)' : '1장 남음'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              발주 요청 수량 (장)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl font-extrabold text-slate-700 text-base"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={orderQty}
                onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                className="flex-1 text-center py-2 font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => setOrderQty(orderQty + 1)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl font-extrabold text-slate-700 text-base"
              >
                +
              </button>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 text-right">
              예상 발주금액: {(product.도매원가 * orderQty).toLocaleString()}원
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              발주 메모
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 매장 품절 리오더"
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              닫기 (주문 안 함)
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-brand-800 hover:bg-brand-900 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              추가 주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
