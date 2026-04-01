# myapt

사용자의 연봉, 현금, 대출 조건, 원하는 지역을 입력하면 대한민국 아파트 매매 실거래가 기준으로 구매 가능한 `단지 + 전용면적 타입`을 보여주는 한국어 웹앱.

## 핵심 원칙
- 가격 판단 기준은 반드시 **실거래가**
- 결과 단위는 **단지 + 전용면적 타입**
- 대출 계산은 **공식 규칙 기반 추정**
- 네이버 부동산은 **외부 링크 목적만 사용**

## 기술 스택
- Next.js 16 / TypeScript / App Router
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Vitest

## 프로젝트 구조
- `src/app` — 화면 / API route
- `src/lib/server/calc.ts` — 구매 가능 예산 계산기
- `src/lib/server/search.ts` — 실거래가 검색 로직
- `src/lib/rules/default-rule-set.json` — 규칙 엔진 기본값
- `src/data/mock/seed.ts` — 개발용 mock 데이터
- `prisma/schema.prisma` — DB 스키마
- `docs/RULE_ENGINE.md` — 규칙 엔진 설명
- `docs/CALCULATION.md` — 계산 로직 설명

## 빠른 시작
```bash
cp .env.example .env
npm install
npm run dev
```

브라우저: `http://localhost:3000`

## PostgreSQL 실행 예시
```bash
docker compose up -d
npx prisma generate
npx prisma db push
```

## 개발용 mock 모드
MVP는 `USE_MOCK_DATA=1`일 때 로컬 mock 실거래 요약 데이터를 사용한다.
이 덕분에 공공 API 키 없이도 UI / 계산 / 검색 플로우를 확인할 수 있다.

## 공공 API 연동 계획
실제 운영에서는 아래 수집 파이프라인으로 확장한다.
1. 지역/월 기준 아파트 매매 실거래가 수집
2. 공동주택 단지 목록 수집
3. 공동주택 기본정보 수집
4. 실거래-단지 매핑
5. `transaction_summaries` 집계 생성


## 공공데이터 수집 1차 구현
현재 아래 스크립트가 구현돼 있다.

```bash
npm run sync:apt-trades -- 11740 202603
```

동작:
- 국토교통부 아파트 매매 실거래가 API 호출
- 지역/월 기준 XML 응답 수집
- 정규화
- `data-cache/transactions/<regionCode>/<YYYYMM>.json` 저장

자세한 내용은 `docs/DATA_PIPELINE.md` 참고.


## 단지 메타 / 매핑 1차 구현
현재 mock 데이터도 단순 카드 하드코딩이 아니라 아래 구조를 따른다.
- 거래 raw row
- 단지 메타 후보
- 단지 + 전용면적 타입 summary 생성

관련 파일:
- `src/lib/server/mapping/transaction-mapper.ts`
- `src/lib/server/public-data/complex-metadata.ts`
- `docs/MAPPING.md`


### 추가 수집 스크립트
```bash
npm run sync:complex-list -- 11740 1
npm run sync:complex-detail -- A10001
```

- `sync:complex-list`: 공동주택 단지 목록 수집 / 정규화 / 스냅샷 저장
- `sync:complex-detail`: 단지 기본정보 수집 / 정규화 / 스냅샷 저장

## 환경 변수
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `USE_MOCK_DATA`: `1`이면 mock 시드 사용
- `PUBLIC_DATA_API_KEY`: 공공 데이터 수집용 키

## 테스트
```bash
npm run test
```

## 구현 범위
- 홈: 재무 입력 + 지역 검색
- 결과: 예산 요약 + 적용 규칙 + 필터 + 실거래가 결과
- 관리자: 규칙 버전 / 금리 / 동기화 상태
- API route: 계산 / 검색 / 관리자 요약
- Prisma 스키마, docker-compose, env.example 포함

## 한계
- 현재 저장/조회는 mock seed 기반 MVP다.
- 실제 공공 API 수집 배치는 `scripts/`와 DB 적재 로직으로 확장하도록 설계했다.
- 은행 실제 심사 결과와 다를 수 있다.
