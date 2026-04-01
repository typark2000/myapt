import { describe, expect, it } from 'vitest';
import { buildApartmentSummariesFromData } from '../src/lib/server/mapping/transaction-mapper';
import { getMockComplexes, getMockTrades } from '../src/data/mock/seed';

describe('transaction mapping and summaries', () => {
  it('builds unit-type summaries from trades + complexes', () => {
    const items = buildApartmentSummariesFromData({
      trades: getMockTrades(),
      complexes: getMockComplexes(),
      periodMonths: 12,
      now: new Date('2026-04-01T00:00:00+09:00')
    });

    expect(items.some((item) => item.complexName === '래미안 강동리버뷰' && item.exclusiveAreaM2 === 59)).toBe(true);
    expect(items.some((item) => item.tradeCount >= 2)).toBe(true);
  });

  it('marks stale data when recent transaction is older than selected period', () => {
    const items = buildApartmentSummariesFromData({
      trades: getMockTrades(),
      complexes: getMockComplexes(),
      periodMonths: 3,
      now: new Date('2026-04-01T00:00:00+09:00')
    });

    const stale = items.find((item) => item.complexName === '더샵 센텀포레');
    expect(stale?.isStale).toBe(true);
  });
});
