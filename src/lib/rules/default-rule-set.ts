import type { RuleSet } from '@/lib/server/rules';

export const defaultRuleSet: RuleSet = {
  version: 'kr-mortgage-2026-01',
  name: '한국 주담대 추정 규칙 2026-01',
  effectiveFrom: '2026-01-01',
  acquisitionCostRate: 0.045,
  baseInterestRatePct: {
    FIXED: 4.2,
    MIXED: 4.0,
    VARIABLE: 3.8
  },
  products: [
    { productType: 'GENERAL_MORTGAGE', regionKind: 'CAPITAL', firstTimeBuyerOnly: false, maxLtv: 0.70, maxDti: 0.60, maxDsr: 0.40, stressRateBps: 120, productMaxLoanKrw: 600000000, priceCapKrw: null, maxTermMonths: 480 },
    { productType: 'GENERAL_MORTGAGE', regionKind: 'LOCAL', firstTimeBuyerOnly: false, maxLtv: 0.70, maxDti: 0.60, maxDsr: 0.40, stressRateBps: 100, productMaxLoanKrw: 600000000, priceCapKrw: null, maxTermMonths: 480 },
    { productType: 'GENERAL_MORTGAGE', regionKind: 'REGULATED', firstTimeBuyerOnly: false, maxLtv: 0.50, maxDti: 0.50, maxDsr: 0.40, stressRateBps: 150, productMaxLoanKrw: 500000000, priceCapKrw: null, maxTermMonths: 420 },
    { productType: 'POLICY_MORTGAGE', regionKind: 'CAPITAL', firstTimeBuyerOnly: true, maxLtv: 0.80, maxDti: 0.60, maxDsr: 0.50, stressRateBps: 50, productMaxLoanKrw: 500000000, priceCapKrw: 900000000, maxTermMonths: 600 },
    { productType: 'POLICY_MORTGAGE', regionKind: 'LOCAL', firstTimeBuyerOnly: true, maxLtv: 0.80, maxDti: 0.60, maxDsr: 0.50, stressRateBps: 50, productMaxLoanKrw: 500000000, priceCapKrw: 900000000, maxTermMonths: 600 },
    { productType: 'POLICY_MORTGAGE', regionKind: 'REGULATED', firstTimeBuyerOnly: true, maxLtv: 0.70, maxDti: 0.60, maxDsr: 0.50, stressRateBps: 70, productMaxLoanKrw: 450000000, priceCapKrw: 900000000, maxTermMonths: 600 }
  ]
};
