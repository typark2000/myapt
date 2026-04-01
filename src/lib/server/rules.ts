import { defaultRuleSet } from '@/lib/rules/default-rule-set';
import type { ProductType, RateType, RegionKind } from '@/lib/types';

export type RuleProduct = {
  productType: ProductType;
  regionKind: RegionKind;
  firstTimeBuyerOnly: boolean;
  maxLtv: number;
  maxDti?: number;
  maxDsr?: number;
  stressRateBps: number;
  productMaxLoanKrw?: number | null;
  priceCapKrw?: number | null;
  maxTermMonths?: number | null;
};

export type RuleSet = {
  version: string;
  name: string;
  effectiveFrom: string;
  acquisitionCostRate: number;
  baseInterestRatePct: Record<RateType, number>;
  products: RuleProduct[];
};

const ruleSet = defaultRuleSet;

export function getDefaultRuleSet() {
  return ruleSet;
}

export function getApplicableProducts(regionKind: RegionKind, isFirstTimeBuyer: boolean) {
  return ruleSet.products.filter((product) => {
    if (product.regionKind !== regionKind) return false;
    if (product.firstTimeBuyerOnly && !isFirstTimeBuyer) return false;
    return true;
  });
}

export function getBaseRate(rateType: RateType) {
  return ruleSet.baseInterestRatePct[rateType];
}
