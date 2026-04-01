# REVIEW.md — myapt

## Correctness
- 구매 가능 예산 계산이 현금/대출/규칙 버전 가정을 함께 표시한다.
- 결과는 `단지 + 전용면적 타입` 단위다.
- 네이버 링크는 direct/fallback 구조를 열어두고 fallback 검색 링크를 사용한다.

## Maintainability
- 계산기 / 규칙 / 검색 / 포맷팅을 분리했다.
- 규칙값은 `src/lib/rules/default-rule-set.ts`로 분리했다.
- 장기적으로 Prisma rule tables로 이관 가능한 스키마 포함.

## Security / Privacy
- 공공 API는 서버 수집 전제로 설계.
- 프론트에서 외부 API 직접 호출하지 않음.
- 민감한 사용자 데이터 저장 기능은 MVP에 넣지 않음.

## Accessibility
- 모바일 기준 카드형 레이아웃.
- 핵심 수치와 설명을 함께 노출.

## Release risk
- 현재 데이터는 mock seed 중심 MVP.
- 실서비스 전에는 공공 데이터 수집/정규화 배치와 실제 DB 적재가 더 필요.
