import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/InventoryManager';
import { PricingCalculator } from './components/PricingCalculator';
import { OrderAndSales } from './components/OrderAndSales';
import { SaleModal } from './components/SaleModal';
import { ProductModal } from './components/ProductModal';
import { ReorderPromptModal } from './components/ReorderPromptModal';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { ToastContainer, ToastMessage } from './components/Toast';
import { StorageService } from './utils/storage';
import { SupabaseService } from './utils/supabaseClient';
import { 상품_테이블, 재고_테이블, 판매_테이블, 발주_테이블, 사이즈구분, 도매상태구분, 판매채널구분 } from './types';

export const App: React.FC = () => {
  // 전역 상태
  const [products, setProducts] = useState<상품_테이블[]>(() => StorageService.getProducts());
  const [inventory, setInventory] = useState<재고_테이블[]>(() => StorageService.getInventory());
  const [sales, setSales] = useState<판매_테이블[]>(() => StorageService.getSales());
  const [orders, setOrders] = useState<발주_테이블[]>(() => StorageService.getOrders());

  // 네비게이션 탭 상태
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inventory' | 'calculator' | 'orders'>('dashboard');

  // 사입 이동 모드 (모바일/사입 현장 전용 대형 터치 타겟 모드)
  const [isFieldMode, setIsFieldMode] = useState<boolean>(false);

  // Supabase 클라우드 연동 상태 (PRD 5)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // 모달 상태
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<상품_테이블 | null>(null);
  const [productDraft, setProductDraft] = useState<Partial<상품_테이블> | null>(null);

  // 1개 이하 재고 감지 시 선택적 추가 주문 모달 상태
  const [reorderModalData, setReorderModalData] = useState<{
    isOpen: boolean;
    product: 상품_테이블 | null;
    size: 사이즈구분;
    remainingStock: number;
  }>({
    isOpen: false,
    product: null,
    size: 'M',
    remainingStock: 0,
  });

  // 토스트 메시지 상태
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 로컬스토리지 자동 영속화
  useEffect(() => {
    StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    StorageService.saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    StorageService.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    StorageService.saveOrders(orders);
  }, [orders]);

  // Supabase 클라우드 동기화 (가져오기 & 연동)
  const syncWithSupabase = useCallback(async (showToastNotice = true) => {
    setIsSyncing(true);
    try {
      const isOk = await SupabaseService.testConnection();
      setIsSupabaseConnected(isOk);

      if (isOk) {
        const [cloudProducts, cloudInventory, cloudSales, cloudOrders] = await Promise.all([
          SupabaseService.fetchProducts(),
          SupabaseService.fetchInventory(),
          SupabaseService.fetchSales(),
          SupabaseService.fetchOrders(),
        ]);

        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        }
        if (cloudInventory && cloudInventory.length > 0) {
          setInventory(cloudInventory);
        }
        if (cloudSales && cloudSales.length > 0) {
          setSales(cloudSales);
        }
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }

        if (showToastNotice) {
          addToast('success', 'Supabase 클라우드 DB와 실시간 동기화 완료', '모든 한글 스키마 테이블 데이터가 성공적으로 갱신되었습니다.');
        }
      } else {
        if (showToastNotice) {
          addToast('info', '로컬 스토리지 모드로 안전하게 작동 중입니다.');
        }
      }
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 앱 로드 시 초기 1회 Supabase 연결 확인 및 자동 동기화
  useEffect(() => {
    syncWithSupabase(false);
  }, [syncWithSupabase]);

  // 재고 증감 (+/-) 핸들러
  const handleUpdateStock = (productId: string, size: 사이즈구분, delta: number) => {
    let updatedInvTarget: 재고_테이블 | null = null;

    setInventory(prev => prev.map(inv => {
      if (inv.상품_아이디 !== productId) return inv;
      const sizeKey = `사이즈_${size}` as keyof 재고_테이블;
      const currentCount = inv[sizeKey] as number;
      const newCount = Math.max(0, currentCount + delta);

      const updated = {
        ...inv,
        [sizeKey]: newCount,
      };
      updated.총재고수량 = updated.사이즈_XS + updated.사이즈_S + updated.사이즈_M + updated.사이즈_L + updated.사이즈_XL;
      updatedInvTarget = updated;
      return updated;
    }));

    if (updatedInvTarget) {
      SupabaseService.upsertInventory(updatedInvTarget);
    }
  };

  // 도매 상태 토글 핸들러
  const handleUpdateWholesaleStatus = (productId: string, status: 도매상태구분) => {
    setProducts(prev => prev.map(p => {
      if (p.아이디 !== productId) return p;
      const updated = { ...p, 도매상태: status };
      SupabaseService.upsertProduct(updated);
      return updated;
    }));
    const targetProd = products.find(p => p.아이디 === productId);
    addToast('info', '도매 상태가 변경되었습니다.', `${targetProd?.상품명 || '상품'} ➜ [${status}]`);
  };

  // 상품 저장 (신규 등록 및 수정)
  const handleSaveProduct = (productData: 상품_테이블, initialStock?: Record<사이즈구분, number>) => {
    if (productToEdit) {
      setProducts(prev => prev.map(p => p.아이디 === productData.아이디 ? productData : p));
      SupabaseService.upsertProduct(productData);
      addToast('success', '상품 정보가 수정되었습니다.', productData.상품명);
    } else {
      setProducts(prev => [productData, ...prev]);
      SupabaseService.upsertProduct(productData);

      const newInventory: 재고_테이블 = {
        아이디: `inv-${Date.now()}`,
        상품_아이디: productData.아이디,
        사이즈_XS: initialStock?.XS ?? 0,
        사이즈_S: initialStock?.S ?? 0,
        사이즈_M: initialStock?.M ?? 0,
        사이즈_L: initialStock?.L ?? 0,
        사이즈_XL: initialStock?.XL ?? 0,
        총재고수량: ((initialStock?.XS ?? 0) + (initialStock?.S ?? 0) + (initialStock?.M ?? 0) + (initialStock?.L ?? 0) + (initialStock?.XL ?? 0)),
      };
      setInventory(prev => [newInventory, ...prev]);
      SupabaseService.upsertInventory(newInventory);
      addToast('success', '새 상품과 재고가 등록되었습니다.', productData.상품명);
    }
  };

  // 상품 삭제 핸들러
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('정말 이 상품과 재고를 삭제하시겠습니까?')) {
      const target = products.find(p => p.아이디 === productId);
      setProducts(prev => prev.filter(p => p.아이디 !== productId));
      setInventory(prev => prev.filter(i => i.상품_아이디 !== productId));
      SupabaseService.deleteProduct(productId);
      addToast('warning', '상품이 삭제되었습니다.', target?.상품명);
    }
  };

  // 추가 주문 핸들러 (수량이 1개 이하일 경우 선택적으로 발주서에 등록)
  const handleAddToOrder = (productId: string, size: 사이즈구분, quantity = 3, memo = '추가 주문 리오더') => {
    const product = products.find(p => p.아이디 === productId);
    if (!product) return;

    const wholesaleName = product.도매처명;
    const todayDateStr = '2026-10-19';

    setOrders(prev => {
      const existingOrderIndex = prev.findIndex(o => o.도매처명 === wholesaleName && o.발주일자 === todayDateStr && o.발주상태 === '대기중');

      if (existingOrderIndex >= 0) {
        const updatedOrders = [...prev];
        const targetOrder = { ...updatedOrders[existingOrderIndex] };
        const items = [...targetOrder.발주품목내역];
        
        const existingItemIndex = items.findIndex(item => item.상품명 === product.상품명 && item.사이즈 === size);
        if (existingItemIndex >= 0) {
          items[existingItemIndex] = {
            ...items[existingItemIndex],
            수량: items[existingItemIndex].수량 + quantity,
            합계: (items[existingItemIndex].수량 + quantity) * product.도매원가,
            메모: memo,
          };
        } else {
          items.push({
            상품명: product.상품명,
            사이즈: size,
            수량: quantity,
            단가: product.도매원가,
            합계: quantity * product.도매원가,
            메모: memo,
          });
        }

        targetOrder.발주품목내역 = items;
        updatedOrders[existingOrderIndex] = targetOrder;
        SupabaseService.upsertOrder(targetOrder);
        return updatedOrders;
      } else {
        const newOrder: 발주_테이블 = {
          아이디: `ord-${Date.now()}`,
          도매처명: wholesaleName,
          도매처연락처: product.도매처연락처,
          발주품목내역: [{
            상품명: product.상품명,
            사이즈: size,
            수량: quantity,
            단가: product.도매원가,
            합계: quantity * product.도매원가,
            메모: memo,
          }],
          발주상태: '대기중',
          발주일자: todayDateStr,
        };
        SupabaseService.upsertOrder(newOrder);
        return [newOrder, ...prev];
      }
    });

    addToast('success', '야간 발주서에 추가되었습니다.', `${product.상품명} (${size}호 ${quantity}장) ➜ ${wholesaleName}`);
  };

  // 판매 등록 핸들러 (무조건 발주서로 넘어가지 않고, 잔여 수량이 1개 이하일 경우 추가주문 팝업/버튼 제공)
  const handleRecordSale = (saleData: {
    상품_아이디: string;
    판매채널: 판매채널구분;
    판매사이즈: 사이즈구분;
    판매수량: number;
    실제판매가: number;
  }) => {
    const newSale: 판매_테이블 = {
      아이디: `sale-${Date.now()}`,
      상품_아이디: saleData.상품_아이디,
      판매채널: saleData.판매채널,
      판매사이즈: saleData.판매사이즈,
      판매수량: saleData.판매수량,
      실제판매가: saleData.실제판매가,
      판매일시: new Date().toISOString(),
    };

    setSales(prev => [newSale, ...prev]);
    SupabaseService.insertSale(newSale);

    // 잔여 수량 계산
    let remainingCount = 0;
    const currentInv = inventory.find(i => i.상품_아이디 === saleData.상품_아이디);
    if (currentInv) {
      const sizeKey = `사이즈_${saleData.판매사이즈}` as keyof 재고_테이블;
      const prevCount = currentInv[sizeKey] as number;
      remainingCount = Math.max(0, prevCount - saleData.판매수량);
    }

    handleUpdateStock(saleData.상품_아이디, saleData.판매사이즈, -saleData.판매수량);

    const product = products.find(p => p.아이디 === saleData.상품_아이디);
    if (product) {
      addToast('success', '판매가 등록되었습니다.', `${product.상품명} (${saleData.판매사이즈}호 ${saleData.판매수량}장 판매)`);

      // 수량이 1개 이하(0개 또는 1개)일 경우 추가 주문하기 모달 트리거
      if (remainingCount <= 1) {
        setTimeout(() => {
          setReorderModalData({
            isOpen: true,
            product,
            size: saleData.판매사이즈,
            remainingStock: remainingCount,
          });
        }, 350);
      }
    }
  };

  // 발주 상태 토글 ('대기중' ↔ '완료')
  const handleToggleOrderStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.아이디 !== orderId) return o;
      const nextStatus: '대기중' | '완료' = o.발주상태 === '대기중' ? '완료' : '대기중';
      const updated: 발주_테이블 = {
        ...o,
        발주상태: nextStatus,
      };
      SupabaseService.upsertOrder(updated);
      addToast('info', `발주 상태가 [${nextStatus}] 상태로 변경되었습니다.`, o.도매처명);
      return updated;
    }));
  };

  // 발주서 삭제
  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.아이디 !== orderId));
    SupabaseService.deleteOrder(orderId);
    addToast('warning', '발주서가 삭제되었습니다.');
  };

  // 계산기에서 신규 상품 추가로 바로 연결
  const handleApplyToNewProduct = (draft: Partial<상품_테이블>) => {
    setProductDraft(draft);
    setProductToEdit(null);
    setIsProductModalOpen(true);
    addToast('info', '계산된 가격이 신규 상품 폼에 자동 입력되었습니다.');
  };

  // 데이터 초기화
  const handleResetData = () => {
    if (window.confirm('테스트용 초기 데이터로 되돌리시겠습니까?')) {
      StorageService.resetAll();
      setProducts(StorageService.getProducts());
      setInventory(StorageService.getInventory());
      setSales(StorageService.getSales());
      setOrders(StorageService.getOrders());
      addToast('info', '초기 데이터로 복원되었습니다.');
    }
  };

  const pendingOrdersCount = orders.filter(o => o.발주상태 === '대기중').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans pb-20 md:pb-0">
      {/* PWA 모바일 앱 설치 안내 배너 */}
      <PwaInstallPrompt />

      {/* 고정 상단 헤더 */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSaleModal={() => setIsSaleModalOpen(true)}
        onOpenProductModal={() => {
          setProductToEdit(null);
          setProductDraft(null);
          setIsProductModalOpen(true);
        }}
        onResetData={handleResetData}
        alertCount={pendingOrdersCount}
        isFieldMode={isFieldMode}
        onToggleFieldMode={() => {
          setIsFieldMode(!isFieldMode);
          addToast('info', !isFieldMode ? '사입 이동 모드가 켜졌습니다.' : '일반 카운터 모드로 전환되었습니다.');
        }}
        isSupabaseConnected={isSupabaseConnected}
        onSyncSupabase={() => syncWithSupabase(true)}
        isSyncing={isSyncing}
      />

      {/* 메인 뷰 컨테이너 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            products={products}
            inventory={inventory}
            sales={sales}
            orders={orders}
            onNavigateTab={setCurrentTab}
            onOpenSaleModal={() => setIsSaleModalOpen(true)}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryManager
            products={products}
            inventory={inventory}
            onUpdateStock={handleUpdateStock}
            onUpdateWholesaleStatus={handleUpdateWholesaleStatus}
            onOpenProductModal={(product) => {
              setProductToEdit(product || null);
              setProductDraft(null);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onAddToOrder={handleAddToOrder}
            isFieldMode={isFieldMode}
          />
        )}

        {currentTab === 'calculator' && (
          <PricingCalculator
            onApplyToNewProduct={handleApplyToNewProduct}
          />
        )}

        {currentTab === 'orders' && (
          <OrderAndSales
            orders={orders}
            sales={sales}
            products={products}
            inventory={inventory}
            onToggleOrderStatus={handleToggleOrderStatus}
            onAddOrder={(order) => {
              setOrders(prev => [order, ...prev]);
              SupabaseService.upsertOrder(order);
            }}
            onDeleteOrder={handleDeleteOrder}
            onOpenSaleModal={() => setIsSaleModalOpen(true)}
            onAddToOrder={handleAddToOrder}
          />
        )}
      </main>

      {/* 푸터 (데스크탑) */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-600">KIDS-BIZ | 아동복 온/오프라인 통합 재고 및 매출 관리 반응형 웹앱</p>
          <p className="mt-1 text-[11px]">
            수량 1개 이하 선택적 추가 주문 · Supabase 한글 컬럼 스키마 100% 준수 · 동대문/남대문 사입 모바일 최적화 · 카카오톡 야간 발주서 복사
          </p>
        </div>
      </footer>

      {/* 모바일 하단 플로팅 네비게이션 바 */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSaleModal={() => setIsSaleModalOpen(true)}
        alertCount={pendingOrdersCount}
      />

      {/* 빠른 판매 등록 모달 */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        products={products}
        inventory={inventory}
        onRecordSale={handleRecordSale}
      />

      {/* 1개 이하 품목 선택적 추가 주문 확인 모달 */}
      <ReorderPromptModal
        isOpen={reorderModalData.isOpen}
        onClose={() => setReorderModalData(prev => ({ ...prev, isOpen: false }))}
        product={reorderModalData.product}
        size={reorderModalData.size}
        remainingStock={reorderModalData.remainingStock}
        onConfirmReorder={handleAddToOrder}
      />

      {/* 상품 등록/수정 모달 */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
          setProductDraft(null);
        }}
        productToEdit={productToEdit}
        initialDraft={productDraft}
        onSaveProduct={handleSaveProduct}
      />

      {/* 토스트 피드백 컨테이너 */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
