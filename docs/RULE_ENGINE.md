# RULE_ENGINE.md

`myapt`의 규칙 엔진은 하드코딩된 if-else 덩어리가 아니라 버전 관리 가능한 설정 레이어를 전제로 한다.

## MVP 구조
- 기본 규칙 파일: `src/lib/rules/default-rule-set.json`
- 런타임 사용 코드: `src/lib/server/rules.ts`
- 계산기: `src/lib/server/calc.ts`
- 장기 구조: Prisma의 `LoanRuleSet`, `LoanRuleProduct` 테이블로 이관 가능

## 현재 반영 축
- 적용 버전
- 지역 유형 (`CAPITAL`, `LOCAL`, `REGULATED`)
- 상품 유형 (`GENERAL_MORTGAGE`, `POLICY_MORTGAGE`, `CASH`)
- 생애최초 여부
- 금리 유형별 기본 금리
- LTV / DTI / DSR / stress rate / 상품 최대한도 / 가격 상한 / 최대 만기

## 확장 포인트
- 기간별 effectiveFrom/effectiveTo 조회
- 1주택 처분 조건 / 다주택 제한
- 가격구간별 LTV 차등
- 전입의무 / 소득요건 / 연령요건 상세화
