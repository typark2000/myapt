import { describe, expect, it } from 'vitest';
import { buildPeriodSummary } from '../src/lib/server/public-data/summary';
import { getMockTrades } from '../src/data/mock/seed';

describe('transaction summary builder', () => {
  it('builds median-based representative summary', () => {
    const trades = getMockTrades().filter((item) => item.apartmentName === '래미안 강동리버뷰' && item.exclusiveAreaM2 === 59);
    const summary = buildPeriodSummary(trades, 12, new Date('2026-04-01T00:00:00+09:00'));
    expect(summary?.representativePriceKrw).toBeGreaterThan(0);
    expect(summary?.tradeCount).toBe(2);
  });

  it('marks stale when no trade exists in selected recent window', () => {
    const trades = getMockTrades().filter((item) => item.apartmentName === '더샵 센텀포레');
    const summary = buildPeriodSummary(trades, 3, new Date('2026-04-01T00:00:00+09:00'));
    expect(summary?.isStale).toBe(true);
  });
});
