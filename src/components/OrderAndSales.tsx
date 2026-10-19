import React, { useState } from 'react';
import { 
  Send, Copy, Check, Clock, Building2, Plus, Trash2, 
  ShoppingBag, Moon, CheckCircle2, Phone, Calendar, AlertTriangle, ArrowRight, ShoppingCart
} from 'lucide-react';
import { 발주_테이블, 판매_테이블, 상품_테이블, 재고_테이블, 발주품목, 사이즈구분 } from '../types';

interface OrderAndSalesProps {
  orders: 발주_테이블[];
  sales: 판매_테이블[];
  products: 상품_테이블[];
  inventory: 재고_테이블[];
  onToggleOrderStatus: (orderId: string) => void;
  onAddOrder: (order: 발주_테이블) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenSaleModal: () => void;
  onAddToOrder: (productId: string, size: 사이즈구분, quantity?: number, memo?: string) => void;
}

export const OrderAndSales: React.FC<OrderAndSalesProps> = ({
  orders,
  sales,
  products,
  inventory,
  onToggleOrderStatus,
  onAddOrder,
  onDeleteOrder,
  onOpenSaleModal,
  onAddToOrder,
}) => {
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-19');

  // 재고가 1개 이하인 품목들 색출 (추가 주문 대상)
  const lowStockItems: {
    product: 상품_테이블;
    size: 사이즈구분;
    stock: number;
  }[] = [];

  const sizes: 사이즈구분[] = ['XS', 'S', 'M', 'L', 'XL'];
  products.forEach(p => {
    const inv = inventory.find(i => i.상품_아이디 === p.아이디);
    if (!inv) return;
    sizes.forEach(size => {
      const stock = inv[`사이즈_${size}` as keyof 재고_테이블] as number;
      if (stock <= 1) {
        lowStockItems.push({
          product: p,
          size,
          stock,
        });
      }
    });
  });

  // 도매처별 카카오톡/문자 발주서 텍스트 생성
  const generateKakaoOrderText = (order: 발주_테이블) => {
    const totalQty = order.발주품목내역.reduce((sum, item) => sum + item.수량, 0);
    const totalAmount = order.발주품목내역.reduce((sum, item) => sum + item.합계, 0);

    const itemsText = order.발주품목내역
      .map((item, idx) => `${idx + 1}. ${item.상품명} (${item.사이즈}호) x ${item.수량}장 ${item.메모 ? `[${item.메모}]` : ''}`)
      .join('\n');

    return `[야간 발주서] KIDS-BIZ 매장
도매처: ${order.도매처명} 사장님
발주일자: ${order.발주일자} 저녁 사입
--------------------------------------
${itemsText}
--------------------------------------
총 ${order.발주품목내역.length}개 품목 / ${totalQty}장
발주 합계 금액: ${totalAmount.toLocaleString()}원

* 사장님 안녕하세요! 오늘 밤 사입 삼촌 방문 시 픽업 부탁드립니다. 대금은 계좌 입금 드렸습니다. 감사합니다!`;
  };

  const handleCopyKakao = (order: 발주_테이블) => {
    const text = generateKakaoOrderText(order);
    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.아이디);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 상단 배너: 야간 발주 안내 */}
      <div className="bg-gradient-to-r from-slateCustom-850 to-brand-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold flex items-center gap-1">
                <Moon className="w-3.5 h-3.5" /> 야간 사입 자동화
              </span>
              <span className="text-xs text-brand-200">기준일: {selectedDate}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              도매처별 원클릭 야간 발주서 관리
            </h2>
            <p className="text-xs text-brand-100 mt-1">
              판매 시 무조건 발주되지 않으며, <strong>수량이 1개 이하로 떨어진 품목을 [추가주문하기] 버튼</strong>으로 선택하여 발주서에 등록합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSaleModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <ShoppingBag className="w-4 h-4" />
              판매 등록하기
            </button>
          </div>
        </div>
      </div>

      {/* 수량 1개 이하 품절 임박 품목 (추가 주문 대기 큐) 섹션 */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  수량 1개 이하 품목 ({lowStockItems.length}건)
                </h3>
                <p className="text-[11px] text-slate-500">
                  원하는 상품의 [추가주문하기]를 누르면 아래 야간 발주서에 즉시 반영됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {lowStockItems.map((item, idx) => {
              const isZero = item.stock === 0;
              return (
                <div
                  key={`${item.product.아이디}-${item.size}-${idx}`}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2 text-xs transition-all"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate">
                      {item.product.상품명}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-brand-900">{item.size}호</span>
                      <span>· {item.product.도매처명}</span>
                      <span className={`font-extrabold ${isZero ? 'text-rose-600' : 'text-amber-700'}`}>
                        ({isZero ? '품절' : '1개 남음'})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToOrder(item.product.아이디, item.size, 3, isZero ? '품절 리오더' : '1개 잔여 추가주문')}
                    className="px-3 py-1.5 bg-brand-850 hover:bg-brand-900 text-white font-bold rounded-lg text-xs shrink-0 flex items-center gap-1 shadow-xs active:scale-95 transition-transform"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    추가주문
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 발주 목록 카드들 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>도매처별 야간 발주서</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {orders.length}개 도매처
            </span>
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
            현재 대기 중인 발주서가 없습니다. 재고 관리 화면이나 위 목록에서 [추가주문하기]를 눌러 발주를 추가하세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.map(order => {
              const isCompleted = order.발주상태 === '완료';
              const totalQty = order.발주품목내역.reduce((sum, item) => sum + item.수량, 0);
              const totalAmount = order.발주품목내역.reduce((sum, item) => sum + item.합계, 0);

              return (
                <div
                  key={order.아이디}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    isCompleted 
                      ? 'border-slate-200 opacity-75 bg-slate-50/50' 
                      : 'border-brand-300 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  {/* 발주 카드 헤더 */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-brand-700" />
                          {order.도매처명}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.발주상태}
                        </span>
                      </div>

                      {order.도매처연락처 && (
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${order.도매처연락처}`} className="hover:underline">
                            {order.도매처연락처}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleOrderStatus(order.아이디)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isCompleted ? '대기로 변경' : '발주 완료'}
                      </button>
                      <button
                        onClick={() => onDeleteOrder(order.아이디)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="발주서 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 품목 리스트 */}
                  <div className="py-3 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">발주 품목 내역</span>
                    {order.발주품목내역.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-xs">품목이 없습니다.</div>
                    ) : (
                      order.발주품목내역.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">
                              {item.상품명}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-brand-100 text-brand-900 rounded font-bold">
                                {item.사이즈}호
                              </span>
                              <span>수량: <strong>{item.수량}장</strong></span>
                              {item.메모 && (
                                <span className="text-slate-400">({item.메모})</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-slate-700">
                              {item.합계.toLocaleString()}원
                            </div>
                            <div className="text-[10px] text-slate-400">
                              단가 {item.단가.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 하단 요약 및 카카오톡 복사 버튼 */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-500">총 {totalQty}장 / </span>
                      <strong className="text-slate-800 font-bold text-sm">
                        {totalAmount.toLocaleString()}원
                      </strong>
                    </div>

                    <button
                      onClick={() => handleCopyKakao(order)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        copiedOrderId === order.아이디
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919]'
                      }`}
                    >
                      {copiedOrderId === order.아이디 ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>복사 완료! (카톡에 붙여넣기)</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>카카오톡 발주서 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
