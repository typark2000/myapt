import type { ApartmentSummary } from '@/lib/types';
import type { NormalizedAptTrade } from '@/lib/server/public-data/types';
import { buildNaverSearchUrl } from '@/lib/server/naver';
import { buildComplexKey, normalizeComplexName, type ComplexMetaCandidate } from '@/lib/server/public-data/complex-metadata';

export type MappingOverride = {
  sourceComplexName: string;
  sourceAddress?: string;
  sourceAreaM2?: number;
  complexId: string;
};

export type UnitSummarySource = {
  complexId: string;
  complexName: string;
  address: string;
  regionName: string;
  householdCount?: number;
  completionYear?: number;
  exclusiveAreaM2: number;
  representativePriceKrw: number;
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

function areaBucket(area: number) {
  return Math.round(area * 10) / 10;
}

function resolveComplexId(trade: NormalizedAptTrade, complexes: ComplexMetaCandidate[], overrides: MappingOverride[]) {
  const override = overrides.find((item) => normalizeComplexName(item.sourceComplexName) === normalizeComplexName(trade.apartmentName) && (!item.sourceAreaM2 || Math.abs(item.sourceAreaM2 - trade.exclusiveAreaM2) < 0.2));
  if (override) return override.complexId;

  const tradeKey = buildComplexKey({ name: trade.apartmentName, legalDong: trade.legalDong, jibun: trade.jibun });
  const exact = complexes.find((complex) => buildComplexKey({ name: complex.name, legalDong: complex.dong, jibun: trade.jibun }) === tradeKey);
  if (exact?.sourceComplexCode) return exact.sourceComplexCode;

  const fallback = complexes.find((complex) => normalizeComplexName(complex.name) === normalizeComplexName(trade.apartmentName) && (complex.dong ?? '') === trade.legalDong);
  return fallback?.sourceComplexCode;
}

export function buildApartmentSummariesFromData(args: {
  trades: NormalizedAptTrade[];
  complexes: ComplexMetaCandidate[];
  overrides?: MappingOverride[];
  periodMonths: number;
  now: Date;
}): ApartmentSummary[] {
  const { trades, complexes, overrides = [], periodMonths, now } = args;
  const grouped = new Map<string, { meta?: ComplexMetaCandidate; tradeRows: NormalizedAptTrade[]; area: number; fallbackName: string; fallbackAddress: string; fallbackRegion: string }>();

  for (const trade of trades) {
    const complexId = resolveComplexId(trade, complexes, overrides) ?? `unmapped:${normalizeComplexName(trade.apartmentName)}:${trade.legalDong}`;
    const key = `${complexId}::${areaBucket(trade.exclusiveAreaM2)}`;
    const meta = complexes.find((item) => item.sourceComplexCode === complexId);
    if (!grouped.has(key)) {
      grouped.set(key, {
        meta,
        tradeRows: [],
        area: areaBucket(trade.exclusiveAreaM2),
        fallbackName: trade.apartmentName,
        fallbackAddress: `${trade.legalDong} ${trade.jibun}`.trim(),
        fallbackRegion: trade.legalDong
      });
    }
    grouped.get(key)!.tradeRows.push(trade);
  }

  return [...grouped.entries()].map(([key, value]) => {
    const prices = value.tradeRows.map((item) => item.tradePriceKrw);
    const latestTrade = [...value.tradeRows].sort((a, b) => b.dealDate.localeCompare(a.dealDate))[0];
    const latestDate = latestTrade.dealDate;
    const latest = new Date(`${latestDate}T00:00:00+09:00`);
    const monthsDiff = (now.getFullYear() - latest.getFullYear()) * 12 + (now.getMonth() - latest.getMonth());
    const isStale = monthsDiff >= periodMonths;
    const meta = value.meta;
    const complexName = meta?.name ?? value.fallbackName;
    const address = meta?.address ?? value.fallbackAddress;
    const regionName = [meta?.sido, meta?.sigungu, meta?.dong].filter(Boolean).join(' ') || value.fallbackRegion;
    return {
      complexId: key,
      complexName,
      address,
      regionName,
      householdCount: meta?.householdCount,
      completionYear: meta?.completionYear,
      exclusiveAreaM2: value.area,
      representativePriceKrw: median(prices),
      latestTradeDate: latestDate,
      tradeCount: value.tradeRows.length,
      isStale,
      staleReason: isStale ? `최근 ${periodMonths}개월 내 거래 부족` : undefined,
      naverUrl: buildNaverSearchUrl(regionName, complexName)
    };
  });
}
