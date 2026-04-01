# QA.md — myapt

## QA Run — 2026-04-01

### Scope
- Next.js MVP scaffold
- affordability calculator
- search flow using mock transaction summaries
- admin summary page
- API routes
- Prisma schema / env / docker-compose / docs

### Commands
```bash
npm run test
npm run build
```

### Result
- status: PASS
- notes:
  - 계산 엔진 단위 테스트 통과
  - 검색 플로우 테스트 통과
  - production build 통과
  - mock 데이터 기준으로 홈 → 결과 → 관리자 흐름 확인 가능
