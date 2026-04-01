import type { NormalizedAptTrade } from './types';

export async function upsertTradeBatch(_db: unknown, trades: NormalizedAptTrade[]) {
  // MVP 1차: 실제 DB 적재 로직의 함수 시그니처와 배치 형태를 먼저 고정한다.
  // 운영 단계에서는 complex / unitType 매핑 후 transaction insert + summary refresh로 확장한다.
  return {
    inserted: 0,
    skipped: trades.length,
    reason: 'MVP 1차는 정규화 및 스냅샷 저장까지 구현, DB 적재는 매핑 단계와 함께 확장 예정'
  };
}
