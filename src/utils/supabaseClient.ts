import { createClient } from '@supabase/supabase-js';
import { 상품_테이블, 재고_테이블, 판매_테이블, 발주_테이블 } from '../types';

// Supabase 접속 정보 (voiofojgktvmwspnwgdr)
const metaEnv = (import.meta as any).env || {};
export const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://voiofojgktvmwspnwgdr.supabase.co';
export const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaW9mb2pna3R2bXdzcG53Z2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjAwMTEsImV4cCI6MjEwNjgzNjAxMX0.kmIAmNgeGUqzCD7z68oJWl_9WevtAm8CjYdQj3yRv6M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * PRD 5. 한글 컬럼명 100% 준수 Supabase API 서비스
 */
export const SupabaseService = {
  // 연결 상태 테스트
  testConnection: async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('상품_테이블').select('아이디').limit(1);
      if (error) {
        console.warn('Supabase connection test notice:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase connection error:', e);
      return false;
    }
  },

  // 상품_테이블 전체 조회
  fetchProducts: async (): Promise<상품_테이블[] | null> => {
    try {
      const { data, error } = await supabase
        .from('상품_테이블')
        .select('*')
        .order('상품명');
      if (error) throw error;
      return data as 상품_테이블[];
    } catch (e) {
      console.error('Supabase fetchProducts error:', e);
      return null;
    }
  },

  // 재고_테이블 전체 조회
  fetchInventory: async (): Promise<재고_테이블[] | null> => {
    try {
      const { data, error } = await supabase
        .from('재고_테이블')
        .select('*');
      if (error) throw error;
      return data as 재고_테이블[];
    } catch (e) {
      console.error('Supabase fetchInventory error:', e);
      return null;
    }
  },

  // 판매_테이블 전체 조회
  fetchSales: async (): Promise<판매_테이블[] | null> => {
    try {
      const { data, error } = await supabase
        .from('판매_테이블')
        .select('*')
        .order('판매일시', { ascending: false });
      if (error) throw error;
      return data as 판매_테이블[];
    } catch (e) {
      console.error('Supabase fetchSales error:', e);
      return null;
    }
  },

  // 발주_테이블 전체 조회
  fetchOrders: async (): Promise<발주_테이블[] | null> => {
    try {
      const { data, error } = await supabase
        .from('발주_테이블')
        .select('*')
        .order('발주일자', { ascending: false });
      if (error) throw error;
      return data as 발주_테이블[];
    } catch (e) {
      console.error('Supabase fetchOrders error:', e);
      return null;
    }
  },

  // 상품 추가/업데이트
  upsertProduct: async (product: 상품_테이블) => {
    try {
      const { error } = await supabase
        .from('상품_테이블')
        .upsert(product);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase upsertProduct error:', e);
    }
  },

  // 재고 업데이트
  upsertInventory: async (inventory: 재고_테이블) => {
    try {
      const { error } = await supabase
        .from('재고_테이블')
        .upsert(inventory);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase upsertInventory error:', e);
    }
  },

  // 판매 등록
  insertSale: async (sale: 판매_테이블) => {
    try {
      const { error } = await supabase
        .from('판매_테이블')
        .insert(sale);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase insertSale error:', e);
    }
  },

  // 발주서 upsert
  upsertOrder: async (order: 발주_테이블) => {
    try {
      const { error } = await supabase
        .from('발주_테이블')
        .upsert(order);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase upsertOrder error:', e);
    }
  },

  // 상품 및 하위 데이터 삭제
  deleteProduct: async (productId: string) => {
    try {
      const { error } = await supabase
        .from('상품_테이블')
        .delete()
        .eq('아이디', productId);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase deleteProduct error:', e);
    }
  },

  // 발주서 삭제
  deleteOrder: async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('발주_테이블')
        .delete()
        .eq('아이디', orderId);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase deleteOrder error:', e);
    }
  }
};
