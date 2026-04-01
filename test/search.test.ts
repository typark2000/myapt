import { describe, expect, it } from 'vitest';
import { calculateAffordability, pickBestScenario } from '../src/lib/server/calc';
import { searchAffordableApartments } from '../src/lib/server/search';

describe('search flow', () => {
  const best = pickBestScenario(calculateAffordability({
    age: 34,
    annualIncomeKrw: 85000000,
    spouseIncomeKrw: 45000000,
    householdType: 'COUPLE',
    cashKrw: 250000000,
    emergencyFundKrw: 30000000,
    existingAnnualDebtServiceKrw: 12000000,
    existingMonthlyDebtServiceKrw: 0,
    ownedHomeCount: 0,
    isFirstTimeBuyer: true,
    loanScenario: 'COMPARE_ALL',
    desiredLoanTermMonths: 360,
    rateType: 'MIXED',
    desiredRegionKind: 'CAPITAL'
  }));

  it('returns unit-type level results', () => {
    const items = searchAffordableApartments({ regionText: '서울', periodMonths: 12, sortBy: 'budgetClosest', staleMode: 'include' }, best);
    expect(items.some((item) => item.exclusiveAreaM2 === 59)).toBe(true);
  });

  it('can exclude stale data', () => {
    const items = searchAffordableApartments({ regionText: '', periodMonths: 3, sortBy: 'budgetClosest', staleMode: 'exclude' }, best);
    expect(items.some((item) => item.isStale)).toBe(false);
  });
});
