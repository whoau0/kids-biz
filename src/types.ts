// PRD 5. 데이터베이스 스키마 한글 컬럼명 100% 준수 타입 정의

export type 도매상태구분 = '교환가능' | '주문가능' | '도매품절' | '교환불가';
export type 판매채널구분 = '온라인' | '오프라인';
export type 사이즈구분 = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface 상품_테이블 {
  아이디: string;
  상품명: string;
  카테고리: string;
  도매처명: string;
  도매처연락처: string;
  도매원가: number;
  적정판매가: number;
  최대할인가: number;
  도매상태: 도매상태구분;
  등록일시?: string;
  사입일자?: string; // 교환 임박일 계산용 (예: 사입 후 14일)
}

export interface 재고_테이블 {
  아이디: string;
  상품_아이디: string;
  사이즈_XS: number; // 5호
  사이즈_S: number;  // 7호
  사이즈_M: number;  // 9호
  사이즈_L: number;  // 11호
  사이즈_XL: number; // 13호
  총재고수량: number;
}

export interface 판매_테이블 {
  아이디: string;
  상품_아이디: string;
  판매채널: 판매채널구분;
  판매사이즈: 사이즈구분;
  판매수량: number;
  실제판매가: number; // 개당 판매가
  판매일시: string; // ISO String or YYYY-MM-DD HH:mm
}

export interface 발주품목 {
  상품명: string;
  사이즈: 사이즈구분;
  수량: number;
  단가: number;
  합계: number;
  메모?: string;
}

export interface 발주_테이블 {
  아이디: string;
  도매처명: string;
  도매처연락처?: string;
  발주품목내역: 발주품목[];
  발주상태: '대기중' | '완료';
  발주일자: string;
}

// UI 결합 헬퍼 타입
export interface 상품재고결합 extends 상품_테이블 {
  재고?: 재고_테이블;
  악성재고경고?: {
    사이즈: 사이즈구분[];
    경고이유: string;
    추천행동: '도매교환' | '최대할인세일';
  };
}

export const 아동복_사이즈_라벨: Record<사이즈구분, string> = {
  XS: 'XS (5호)',
  S: 'S (7호)',
  M: 'M (9호)',
  L: 'L (11호)',
  XL: 'XL (13호)',
};
