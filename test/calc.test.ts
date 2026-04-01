import { describe, expect, it } from 'vitest';
import { calculateAffordability, pickBestScenario } from '../src/lib/server/calc';

describe('affordability calculator', () => {
  const input = {
    age: 34,
    annualIncomeKrw: 85000000,
    spouseIncomeKrw: 45000000,
    householdType: 'COUPLE' as const,
    cashKrw: 250000000,
    emergencyFundKrw: 30000000,
    existingAnnualDebtServiceKrw: 12000000,
    existingMonthlyDebtServiceKrw: 0,
    ownedHomeCount: 0,
    isFirstTimeBuyer: true,
    loanScenario: 'COMPARE_ALL' as const,
    desiredLoanTermMonths: 360,
    rateType: 'MIXED' as const,
    desiredRegionKind: 'CAPITAL' as const
  };

  it('returns multiple scenarios', () => {
    const results = calculateAffordability(input);
    expect(results.length).toBeGreaterThan(1);
  });

  it('selects best scenario by max purchase price', () => {
    const best = pickBestScenario(calculateAffordability(input));
    expect(best.maxPurchasePriceKrw).toBeGreaterThan(0);
    expect(best.assumptions.ruleVersion).toContain('2026');
  });

  it('handles zero monthly capacity gracefully', () => {
    const results = calculateAffordability({ ...input, existingMonthlyDebtServiceKrw: 10_000_000 });
    const general = results.find((item) => item.productType === 'GENERAL_MORTGAGE');
    expect(general?.estimatedMaxLoanKrw ?? 0).toBe(0);
  });
});
