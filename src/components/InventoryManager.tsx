import React, { useState } from 'react';
import { 
  Plus, Search, Phone, Filter, AlertTriangle, ArrowUpDown, 
  Check, RefreshCw, Tag, ChevronDown, Sparkles, MessageCircle, Smartphone, ShoppingCart
} from 'lucide-react';
import { 상품_테이블, 재고_테이블, 사이즈구분, 도매상태구분, 아동복_사이즈_라벨 } from '../types';

interface InventoryManagerProps {
  products: 상품_테이블[];
  inventory: 재고_테이블[];
  onUpdateStock: (productId: string, size: 사이즈구분, delta: number) => void;
  onUpdateWholesaleStatus: (productId: string, status: 도매상태구분) => void;
  onOpenProductModal: (product?: 상품_테이블) => void;
  onDeleteProduct: (productId: string) => void;
  onAddToOrder: (productId: string, size: 사이즈구분, quantity?: number, memo?: string) => void;
  isFieldMode?: boolean;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  inventory,
  onUpdateStock,
  onUpdateWholesaleStatus,
  onOpenProductModal,
  onDeleteProduct,
  onAddToOrder,
  isFieldMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWholesaleFilter, setSelectedWholesaleFilter] = useState<string>('전체');
  const [filterStaleOnly, setFilterStaleOnly] = useState<boolean>(false);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);

  const sizes: 사이즈구분[] = ['XS', 'S', 'M', 'L', 'XL'];

  // AI 악성 재고 판별 로직 (사입일 기준 14일 초과 & 재고 4개 이상 체증)
  const today = new Date('2026-10-19');
  const checkStaleInventory = (product: 상품_테이블, inv?: 재고_테이블) => {
    if (!product.사입일자 || !inv) return null;
    const buyDate = new Date(product.사입일자);
    const diffDays = Math.floor((today.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 14) {
      const staleSizes: 사이즈구분[] = [];
      if (inv.사이즈_XS >= 4) staleSizes.push('XS');
      if (inv.사이즈_S >= 4) staleSizes.push('S');
      if (inv.사이즈_M >= 4) staleSizes.push('M');
      if (inv.사이즈_L >= 4) staleSizes.push('L');
      if (inv.사이즈_XL >= 4) staleSizes.push('XL');

      if (staleSizes.length > 0) {
        return {
          diffDays,
          staleSizes,
          recommendation: product.도매상태 === '교환가능' ? '도매교환' : '마지노선세일',
        };
      }
    }
    return null;
  };

  const wholesaleList = ['전체', ...Array.from(new Set(products.map(p => p.도매처명)))];

  const filteredProducts = products.filter(p => {
    const inv = inventory.find(i => i.상품_아이디 === p.아이디);
    const staleInfo = checkStaleInventory(p, inv);

    // 1개 이하 재고 보유 상품 확인
    const hasLowStock = inv && (
      inv.사이즈_XS <= 1 || inv.사이즈_S <= 1 || inv.사이즈_M <= 1 || inv.사이즈_L <= 1 || inv.사이즈_XL <= 1
    );

    if (filterLowStockOnly && !hasLowStock) return false;
    if (filterStaleOnly && !staleInfo) return false;
    if (selectedWholesaleFilter !== '전체' && p.도매처명 !== selectedWholesaleFilter) return false;
    if (searchTerm.trim() !== '') {
      const matchName = p.상품명.toLowerCase().includes(searchTerm.toLowerCase());
      const matchWholesale = p.도매처명.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = p.카테고리.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchWholesale || matchCat;
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 사입 이동 모드 안내 배너 */}
      {isFieldMode && (
        <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">동대문 / 남대문 사입 이동 모드 활성화 중</h4>
              <p className="text-xs text-amber-100 mt-0.5">
                이동 중 흔들리는 환경에서도 터치하기 쉽도록 버튼 크기와 글씨를 최대화했습니다.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white text-amber-900 rounded-lg">
            터치 최적화 ON
          </span>
        </div>
      )}

      {/* 상단 컨트롤 바 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-850 flex items-center gap-2">
              <span>온/오프라인 통합 재고 및 거래처 관리</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 font-bold">
                {products.length}개 상품
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              5호~13호 사이즈별 실시간 재고 관리 · <strong>수량 1개 이하 시 [추가주문]</strong> 버튼 지원
            </p>
          </div>

          <button
            onClick={() => onOpenProductModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-850 hover:bg-brand-900 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all self-stretch sm:self-auto min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>신규 상품 추가</span>
          </button>
        </div>

        {/* 검색 및 필터 컨트롤 */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="상품명, 카테고리, 도매처 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all min-h-[44px]"
            />
          </div>

          {/* 도매처 빠른 필터 */}
          <select
            value={selectedWholesaleFilter}
            onChange={(e) => setSelectedWholesaleFilter(e.target.value)}
            className="text-xs sm:text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px] font-medium"
          >
            {wholesaleList.map(w => (
              <option key={w} value={w}>거래처: {w}</option>
            ))}
          </select>

          {/* 1개 이하 품절 임박 필터 */}
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              filterLowStockOnly
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>1개 이하 (추가주문 대상)</span>
          </button>

          {/* AI 악성 재고 토글 */}
          <button
            onClick={() => setFilterStaleOnly(!filterStaleOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              filterStaleOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 악성 재고 모아보기</span>
          </button>
        </div>
      </div>

      {/* 상품 및 재고 리스트 */}
      <div className="space-y-3.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            일치하는 상품 및 재고가 없습니다.
          </div>
        ) : (
          filteredProducts.map(product => {
            const inv = inventory.find(i => i.상품_아이디 === product.아이디);
            const staleInfo = checkStaleInventory(product, inv);
            const totalStock = inv ? (inv.사이즈_XS + inv.사이즈_S + inv.사이즈_M + inv.사이즈_L + inv.사이즈_XL) : 0;

            return (
              <div
                key={product.아이디}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                  staleInfo 
                    ? 'border-rose-200 shadow-sm ring-2 ring-rose-200/50' 
                    : 'border-slate-200/90 shadow-2xs hover:border-brand-300'
                }`}
              >
                {/* 상단: 상품 기본 정보 및 도매처, 상태 태그 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {product.카테고리}
                      </span>
                      <h3 className={`font-bold text-slate-900 ${isFieldMode ? 'text-lg' : 'text-base'}`}>
                        {product.상품명}
                      </h3>
                      {staleInfo && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          AI 경고: {staleInfo.diffDays}일 정체 ({staleInfo.staleSizes.join(', ')}호)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        🏢 {product.도매처명}
                      </span>
                      <a 
                        href={`tel:${product.도매처연락처}`} 
                        className="text-brand-800 hover:underline flex items-center gap-1 font-semibold bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200/50"
                        title="전화 걸기"
                      >
                        <Phone className="w-3 h-3 text-brand-700" />
                        {product.도매처연락처}
                      </a>
                      <span className="text-slate-400">| 사입일: {product.사입일자 || '기록없음'}</span>
                    </div>
                  </div>

                  {/* 우측 도매 상태 토글 */}
                  <div className="flex items-center gap-1 self-start sm:self-auto flex-wrap">
                    {(['교환가능', '주문가능', '도매품절', '교환불가'] as 도매상태구분[]).map(status => {
                      const isCurrent = product.도매상태 === status;
                      let colorClass = 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200';
                      if (isCurrent) {
                        if (status === '교환가능') colorClass = 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs';
                        else if (status === '주문가능') colorClass = 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs';
                        else if (status === '도매품절') colorClass = 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs';
                        else if (status === '교환불가') colorClass = 'bg-slate-700 text-white font-bold border-slate-700 shadow-xs';
                      }

                      return (
                        <button
                          key={status}
                          onClick={() => onUpdateWholesaleStatus(product.아이디, status)}
                          className={`px-3 py-1.5 text-xs rounded-xl transition-all min-h-[36px] ${colorClass}`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 중간: AI 악성재고 추천 배너 */}
                {staleInfo && (
                  <div className="mt-3 p-3 bg-rose-50/80 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="text-rose-950">
                      <strong className="text-rose-800">💡 AI 처방 솔루션: </strong>
                      {staleInfo.recommendation === '도매교환' ? (
                        <span>
                          도매처가 [교환가능] 상태입니다. 정체된 <strong>{staleInfo.staleSizes.join(', ')}호</strong> 재고를 삼촌 방문 시 다른 인기 사이즈나 신상으로 맞교환 요청하세요!
                        </span>
                      ) : (
                        <span>
                          현재 [교환불가/품절]입니다. 원가 손실을 방지하기 위해 마지노선 할인가인 <strong>{product.최대할인가.toLocaleString()}원</strong>으로 긴급 플래시 세일을 진행하세요.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {staleInfo.recommendation === '도매교환' ? (
                        <a
                          href={`sms:${product.도매처연락처}?body=${encodeURIComponent(`[교환문의] 안녕하세요 사장님, ${product.상품명} ${staleInfo.staleSizes.join(',')}호 맞교환 가능할까요?`)}`}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs min-h-[40px]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          교환 문자 전송
                        </a>
                      ) : (
                        <button
                          onClick={() => alert(`최대 할인가 ${product.최대할인가.toLocaleString()}원이 복사되었습니다. 스마트스토어/매장 POP에 적용하세요.`)}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs min-h-[40px]"
                        >
                          <Tag className="w-4 h-4" />
                          마지노선 할인가 복사
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 하단: 5단위 아동복 사이즈별 재고 증감 및 1개 이하 시 [추가주문] 버튼 */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2.5 sm:gap-3">
                  {sizes.map(sizeKey => {
                    const countKey = `사이즈_${sizeKey}` as keyof 재고_테이블;
                    const count = inv ? (inv[countKey] as number) : 0;
                    const isStaleSize = staleInfo?.staleSizes.includes(sizeKey);
                    const isLowStock = count <= 1; // 1개 이하 여부 (0개 또는 1개)

                    return (
                      <div
                        key={sizeKey}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-between transition-all ${
                          count === 0
                            ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                            : count === 1
                            ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                            : isStaleSize
                            ? 'bg-orange-50/50 border-orange-200'
                            : 'bg-white border-slate-200 hover:border-brand-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-xs font-bold text-slate-600 mb-1">
                          <span>{아동복_사이즈_라벨[sizeKey]}</span>
                          {count === 0 ? (
                            <span className="text-[10px] text-rose-600 font-extrabold bg-rose-100 px-1 rounded">품절</span>
                          ) : count === 1 ? (
                            <span className="text-[10px] text-amber-700 font-extrabold bg-amber-100 px-1 rounded">1개남음</span>
                          ) : isStaleSize ? (
                            <span className="text-[10px] text-orange-600 font-extrabold bg-orange-100 px-1 rounded">정체</span>
                          ) : null}
                        </div>

                        {/* 수량 표시 */}
                        <div className="my-1">
                          <span className={`font-extrabold ${
                            isFieldMode ? 'text-2xl' : 'text-xl'
                          } ${
                            count === 0 
                              ? 'text-rose-500' 
                              : count === 1
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}>
                            {count}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">장</span>
                        </div>

                        {/* 수량 조정 (+/-) 버튼 */}
                        <div className="flex items-center gap-1.5 w-full mt-1">
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.아이디, sizeKey, -1)}
                            disabled={count <= 0}
                            aria-label={`${sizeKey} 수량 감소`}
                            className={`flex-1 ${
                              isFieldMode ? 'h-10' : 'h-8'
                            } bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-slate-800 font-extrabold text-base transition-all flex items-center justify-center`}
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(product.아이디, sizeKey, 1)}
                            aria-label={`${sizeKey} 수량 증가`}
                            className={`flex-1 ${
                              isFieldMode ? 'h-10' : 'h-8'
                            } bg-brand-100 hover:bg-brand-200 active:bg-brand-300 text-brand-950 rounded-xl font-extrabold text-base transition-all flex items-center justify-center`}
                          >
                            +
                          </button>
                        </div>

                        {/* 요구사항: 수량이 1개 이하일 경우 [추가주문하기] 버튼 활성화 */}
                        {isLowStock && (
                          <button
                            type="button"
                            onClick={() => onAddToOrder(product.아이디, sizeKey, 3, count === 0 ? '품절 긴급 발주' : '1개 잔여 리오더')}
                            title="야간 발주서에 이 상품 추가 주문"
                            className="w-full mt-2 py-1.5 px-2 bg-gradient-to-r from-amber-600 to-brand-700 hover:from-amber-700 hover:to-brand-800 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>추가주문</span>
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* 총 재고 및 가격 요약 카드 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs">
                    <div className="flex justify-between items-center text-slate-600 text-xs">
                      <span className="font-medium">총 보유 수량</span>
                      <span className="font-extrabold text-slate-900 text-base">{totalStock}장</span>
                    </div>
                    <div className="space-y-1 my-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>도매원가:</span>
                        <span className="font-semibold">{product.도매원가.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-brand-800 font-bold">
                        <span>적정판매:</span>
                        <span>{product.적정판매가.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-semibold">
                        <span>최대할인:</span>
                        <span>{product.최대할인가.toLocaleString()}원</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-200">
                      <button
                        onClick={() => onOpenProductModal(product)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline min-h-[30px] flex items-center"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.아이디)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline min-h-[30px] flex items-center"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
