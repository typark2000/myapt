# DATA_PIPELINE.md

## 목표
사용자 요청 시 외부 API를 실시간으로 여러 번 때리지 않고, 서버 사이드 수집 → 정규화 → DB/캐시 검색 구조를 만든다.

## 이번 1차 구현 범위
- 공식 아파트 매매 실거래가 API 수집기
- 지역코드(`LAWD_CD`) + 년월(`YYYYMM`) 기준 수집
- XML 응답 파싱
- 실거래 정규화
- 파일 스냅샷 저장
- 향후 DB 적재 함수 시그니처 고정

## 현재 스크립트
```bash
npm run sync:apt-trades -- 11740 202603
```

예시:
- `11740`: 서울 강동구 예시 코드
- `202603`: 2026년 3월 거래

## 산출물
- `data-cache/transactions/<regionCode>/<YYYYMM>.json`

## 다음 단계
1. 지역 코드 시드 테이블 추가
2. 공동주택 단지 목록 수집기 추가
3. 공동주택 기본정보 수집기 추가
4. 실거래 ↔ 단지 ↔ 전용면적 매핑
5. `transactions`, `transaction_summaries` 적재/갱신
6. `sync_jobs` 상태 기록
7. 관리자 UI에 마지막 동기화 결과 노출

## 주의
- 서비스키는 `PUBLIC_DATA_API_KEY` 환경변수로만 사용
- 클라이언트에서 직접 호출하지 않음
- 가격 판단 기준은 여전히 실거래가만 사용


## 이번 2차 구현 범위
- 공동주택 단지 목록 수집기 1차
- 공동주택 기본정보 수집기 1차
- 단지 메타 정규화
- 단지 메타 스냅샷 저장
- 실거래 매핑에 연결 가능한 candidate 구조

### 추가 스크립트
```bash
npm run sync:complex-list -- 11740 1
npm run sync:complex-detail -- A10001
```
