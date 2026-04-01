import { subMonths } from 'date-fns';
import type { NormalizedAptTrade } from './types';

export type PeriodSummary = {
  periodMonths: number;
  representativePriceKrw: number;
  medianPriceKrw: number;
  latestTradeDate: string;
  tradeCount: number;
  isStale: boolean;
  staleReason?: string;
};

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

export function buildPeriodSummary(trades: NormalizedAptTrade[], periodMonths: number, now: Date): PeriodSummary | null {
  if (!trades.length) return null;
  const cutoff = subMonths(now, periodMonths);
  const filtered = trades.filter((trade) => new Date(`${trade.dealDate}T00:00:00+09:00`) >= cutoff);
  const base = filtered.length ? filtered : trades;
  const prices = base.map((trade) => trade.tradePriceKrw);
  const latestTradeDate = [...base].sort((a, b) => b.dealDate.localeCompare(a.dealDate))[0].dealDate;
  const latestDate = new Date(`${latestTradeDate}T00:00:00+09:00`);
  const isStale = latestDate < cutoff;
  return {
    periodMonths,
    representativePriceKrw: median(prices),
    medianPriceKrw: median(prices),
    latestTradeDate,
    tradeCount: base.length,
    isStale,
    staleReason: isStale ? `최근 ${periodMonths}개월 이내 거래 부족` : undefined
  };
}
