# INGESTION.md

## 적재 원칙
`myapt`의 적재는 아래 순서를 따른다.

1. raw snapshot 보존
2. `Complex` / `ComplexMetadata` upsert
3. `UnitType` 확보
4. `Transaction` insert
5. `TransactionSummary` refresh
6. `SyncJob` 기록

## 왜 이 순서인가
- 거래는 단독으로 검색 가치가 낮고, 단지/전용면적 맥락이 붙어야 서비스 검색에 쓸 수 있다.
- 단지 메타 없이 거래부터 넣으면 같은 이름의 다른 단지를 구분하기 어렵다.
- summary는 거래 insert 뒤에 만드는 게 일관성이 높다.

## 현재 스크립트
```bash
npm run db:push
npm run db:generate
npm run import:snapshots
```

## 현재 구현 범위
- complex snapshot 로드
- trade snapshot 로드
- complex upsert
- unit type 생성
- trade create
- period(3/6/12/24개월) summary upsert
- sync_jobs 기록

## 현재 한계
- 거래 dedupe key 고도화 필요
- 단지 상세정보(builder, parking 등) DB 반영은 다음 단계
- region code seed와 override admin 연결은 다음 단계
