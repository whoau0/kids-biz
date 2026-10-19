-- ====================================================================
-- KIDS-BIZ (아동복 온/오프라인 통합 재고 및 매출 관리)
-- Supabase 데이터베이스 스키마 및 초기 데이터 (PRD 5번 규격 준수)
-- 주의: 모든 열(Column) 이름은 한글로 명명되었습니다.
-- ====================================================================

-- 1. 상품_테이블 (products)
CREATE TABLE IF NOT EXISTS public."상품_테이블" (
    "아이디" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "상품명" text NOT NULL,
    "카테고리" text,
    "도매처명" text NOT NULL,
    "도매처연락처" text,
    "도매원가" integer NOT NULL DEFAULT 0,
    "적정판매가" integer NOT NULL DEFAULT 0,
    "최대할인가" integer NOT NULL DEFAULT 0,
    "도매상태" text NOT NULL DEFAULT '교환가능'
);

-- 2. 재고_테이블 (inventory)
CREATE TABLE IF NOT EXISTS public."재고_테이블" (
    "아이디" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "상품_아이디" uuid NOT NULL REFERENCES public."상품_테이블"("아이디") ON DELETE CASCADE,
    "사이즈_XS" integer NOT NULL DEFAULT 0,
    "사이즈_S" integer NOT NULL DEFAULT 0,
    "사이즈_M" integer NOT NULL DEFAULT 0,
    "사이즈_L" integer NOT NULL DEFAULT 0,
    "사이즈_XL" integer NOT NULL DEFAULT 0,
    "총재고수량" integer NOT NULL DEFAULT 0
);

-- 3. 판매_테이블 (sales)
CREATE TABLE IF NOT EXISTS public."판매_테이블" (
    "아이디" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "상품_아이디" uuid NOT NULL REFERENCES public."상품_테이블"("아이디") ON DELETE CASCADE,
    "판매채널" text NOT NULL,
    "판매사이즈" text NOT NULL,
    "판매수량" integer NOT NULL DEFAULT 1,
    "실제판매가" integer NOT NULL DEFAULT 0,
    "판매일시" timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. 발주_테이블 (orders)
CREATE TABLE IF NOT EXISTS public."발주_테이블" (
    "아이디" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "도매처명" text NOT NULL,
    "발주품목내역" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "발주상태" text NOT NULL DEFAULT '대기중',
    "발주일자" date NOT NULL DEFAULT CURRENT_DATE
);

-- Row Level Security (RLS) 및 접근 정책
ALTER TABLE public."상품_테이블" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."재고_테이블" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."판매_테이블" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."발주_테이블" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "상품_테이블_anon_policy" ON public."상품_테이블";
    CREATE POLICY "상품_테이블_anon_policy" ON public."상품_테이블" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "재고_테이블_anon_policy" ON public."재고_테이블";
    CREATE POLICY "재고_테이블_anon_policy" ON public."재고_테이블" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "판매_테이블_anon_policy" ON public."판매_테이블";
    CREATE POLICY "판매_테이블_anon_policy" ON public."판매_테이블" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "발주_테이블_anon_policy" ON public."발주_테이블";
    CREATE POLICY "발주_테이블_anon_policy" ON public."발주_테이블" FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- 초기 테스트 데이터 (남대문/동대문 아동복 사입 실무 데이터)
INSERT INTO public."상품_테이블" ("아이디", "상품명", "카테고리", "도매처명", "도매처연락처", "도매원가", "적정판매가", "최대할인가", "도매상태")
VALUES 
('a0000001-0000-0000-0000-000000000001', '봉봉 소프트 피치 기모 맨투맨', '상의', '남대문 부르뎅 (아랑)', '010-3847-2918', 12000, 26000, 16500, '주문가능'),
('a0000001-0000-0000-0000-000000000002', '베베 덤블 테디베어 후드 자켓', '아우터', '동대문 혜양 (코코베베)', '010-9281-5401', 28000, 59000, 38000, '교환가능'),
('a0000001-0000-0000-0000-000000000003', '골지 스판 코튼 레깅스 (1+1)', '하의', '남대문 포키 (쁘띠앙)', '010-4491-8823', 7500, 17000, 11000, '주문가능'),
('a0000001-0000-0000-0000-000000000004', '플라워 프릴 코튼 원피스', '원피스/세트', '남대문 부르뎅 (아랑)', '010-3847-2918', 19000, 42000, 26500, '교환가능'),
('a0000001-0000-0000-0000-000000000005', '데일리 코듀로이 밴딩 와이드 팬츠', '하의', '동대문 제일평화 (리틀마켓)', '010-7722-1982', 14000, 31000, 19500, '도매품절'),
('a0000001-0000-0000-0000-000000000006', '마카롱 베이직 오버핏 가디건', '아우터', '남대문 마마 (줄리앙)', '010-5510-3392', 16500, 36000, 22800, '교환불가')
ON CONFLICT ("아이디") DO NOTHING;

INSERT INTO public."재고_테이블" ("아이디", "상품_아이디", "사이즈_XS", "사이즈_S", "사이즈_M", "사이즈_L", "사이즈_XL", "총재고수량")
VALUES 
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 6, 5, 1, 0, 7, 19),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 2, 3, 4, 2, 1, 12),
('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 12, 8, 15, 9, 6, 50),
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 4, 3, 0, 5, 4, 16),
('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 1, 0, 2, 0, 3, 6),
('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 3, 4, 2, 5, 2, 16)
ON CONFLICT ("아이디") DO NOTHING;

INSERT INTO public."판매_테이블" ("아이디", "상품_아이디", "판매채널", "판매사이즈", "판매수량", "실제판매가", "판매일시")
VALUES 
('c0000001-0000-0000-0000-000000000101', 'a0000001-0000-0000-0000-000000000002', '온라인', 'M', 1, 59000, '2026-10-19 11:20:00+09'),
('c0000001-0000-0000-0000-000000000102', 'a0000001-0000-0000-0000-000000000003', '온라인', 'S', 2, 17000, '2026-10-19 13:45:00+09'),
('c0000001-0000-0000-0000-000000000103', 'a0000001-0000-0000-0000-000000000001', '오프라인', 'M', 1, 26000, '2026-10-19 14:10:00+09'),
('c0000001-0000-0000-0000-000000000104', 'a0000001-0000-0000-0000-000000000004', '오프라인', 'M', 1, 42000, '2026-10-19 15:30:00+09'),
('c0000001-0000-0000-0000-000000000105', 'a0000001-0000-0000-0000-000000000003', '온라인', 'L', 1, 17000, '2026-10-19 16:05:00+09')
ON CONFLICT ("아이디") DO NOTHING;

INSERT INTO public."발주_테이블" ("아이디", "도매처명", "발주품목내역", "발주상태", "발주일자")
VALUES 
('d0000001-0000-0000-0000-000000000001', '남대문 부르뎅 (아랑)', '[{"단가": 12000, "메모": "오늘 오프라인 품절건", "수량": 3, "합계": 36000, "사이즈": "M", "상품명": "봉봉 소프트 피치 기모 맨투맨"}, {"단가": 19000, "메모": "매장 완판 리오더", "수량": 2, "합계": 38000, "사이즈": "M", "상품명": "플라워 프릴 코튼 원피스"}]'::jsonb, '대기중', '2026-10-19'),
('d0000001-0000-0000-0000-000000000002', '동대문 혜양 (코코베베)', '[{"단가": 28000, "메모": "온라인 당일 주문분", "수량": 2, "합계": 56000, "사이즈": "M", "상품명": "베베 덤블 테디베어 후드 자켓"}]'::jsonb, '대기중', '2026-10-19')
ON CONFLICT ("아이디") DO NOTHING;
