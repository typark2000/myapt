import { parseISO, subMonths } from 'date-fns';
import { getMockApartments } from '@/data/mock/seed';
import type { AffordabilityResult, SearchFilters, SearchResultItem } from '@/lib/types';

export function searchAffordableApartments(filters: SearchFilters, affordability: AffordabilityResult): SearchResultItem[] {
  const now = new Date('2026-04-01T00:00:00+09:00');
  const staleCutoff = subMonths(now, filters.periodMonths);
  let items = getMockApartments().filter((item) => {
    const regionText = [item.regionName, item.address, item.complexName].join(' ');
    if (filters.regionText && !regionText.includes(filters.regionText)) return false;
    if (filters.sido && !item.address.includes(filters.sido)) return false;
    if (filters.sigungu && !item.address.includes(filters.sigungu)) return false;
    if (filters.dong && !item.address.includes(filters.dong)) return false;
    if (filters.keyword && !regionText.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
    if (filters.minHouseholds && (item.householdCount ?? 0) < filters.minHouseholds) return false;
    if (filters.maxHouseholds && (item.householdCount ?? 999999) > filters.maxHouseholds) return false;
    if (filters.minCompletionYear && (item.completionYear ?? 0) < filters.minCompletionYear) return false;
    if (filters.maxCompletionYear && (item.completionYear ?? 9999) > filters.maxCompletionYear) return false;
    if (filters.minExclusiveAreaM2 && item.exclusiveAreaM2 < filters.minExclusiveAreaM2) return false;
    if (filters.maxExclusiveAreaM2 && item.exclusiveAreaM2 > filters.maxExclusiveAreaM2) return false;
    if (filters.staleMode === 'exclude' && parseISO(item.latestTradeDate) < staleCutoff) return false;
    return true;
  }).map((item) => {
    const acquisitionCostKrw = Math.round(item.representativePriceKrw * affordability.assumptions.acquisitionCostRate);
    const estimatedLoanNeedKrw = Math.max(0, item.representativePriceKrw + acquisitionCostKrw - affordability.usableCashKrw);
    const isAffordable = item.representativePriceKrw <= affordability.maxPurchasePriceKrw;
    const monthlyRepaymentKrw = affordability.estimatedMaxLoanKrw > 0
      ? Math.round((estimatedLoanNeedKrw / affordability.estimatedMaxLoanKrw) * affordability.monthlyRepaymentKrw)
      : 0;
    return {
      ...item,
      budgetDeltaKrw: affordability.maxPurchasePriceKrw - item.representativePriceKrw,
      isAffordable,
      estimatedLoanNeedKrw,
      estimatedMonthlyRepaymentKrw: monthlyRepaymentKrw
    };
  });

  items.sort((a, b) => {
    switch (filters.sortBy) {
      case 'priceAsc': return a.representativePriceKrw - b.representativePriceKrw;
      case 'latestTradeDesc': return b.latestTradeDate.localeCompare(a.latestTradeDate);
      case 'completionYearAsc': return (a.completionYear ?? 9999) - (b.completionYear ?? 9999);
      case 'householdDesc': return (b.householdCount ?? 0) - (a.householdCount ?? 0);
      default: return Math.abs(a.budgetDeltaKrw) - Math.abs(b.budgetDeltaKrw);
    }
  });

  return items;
}
