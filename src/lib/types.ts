export type RegionKind = 'CAPITAL' | 'LOCAL' | 'REGULATED';
export type ProductType = 'CASH' | 'GENERAL_MORTGAGE' | 'POLICY_MORTGAGE';
export type RateType = 'FIXED' | 'MIXED' | 'VARIABLE';
export type HouseholdType = 'SINGLE' | 'COUPLE' | 'FAMILY';

export type UserFinanceInput = {
  age: number;
  annualIncomeKrw: number;
  spouseIncomeKrw?: number;
  householdType: HouseholdType;
  cashKrw: number;
  emergencyFundKrw?: number;
  existingAnnualDebtServiceKrw?: number;
  existingMonthlyDebtServiceKrw?: number;
  ownedHomeCount: number;
  isFirstTimeBuyer: boolean;
  loanScenario: 'CASH_ONLY' | 'GENERAL_ONLY' | 'POLICY_ONLY' | 'COMPARE_ALL';
  desiredLoanTermMonths: number;
  rateType: RateType;
  interestRatePct?: number;
  desiredRegionKind: RegionKind;
};

export type SearchFilters = {
  regionText?: string;
  sido?: string;
  sigungu?: string;
  dong?: string;
  keyword?: string;
  minHouseholds?: number;
  maxHouseholds?: number;
  minCompletionYear?: number;
  maxCompletionYear?: number;
  minExclusiveAreaM2?: number;
  maxExclusiveAreaM2?: number;
  periodMonths: 3 | 6 | 12 | 24;
  sortBy: 'budgetClosest' | 'priceAsc' | 'latestTradeDesc' | 'completionYearAsc' | 'householdDesc';
  staleMode?: 'include' | 'exclude';
  page?: number;
  pageSize?: number;
};

export type LoanAssumptions = {
  ruleVersion: string;
  regionKind: RegionKind;
  productType: ProductType;
  appliedInterestRatePct: number;
  stressAppliedRatePct: number;
  termMonths: number;
  maxLtv: number;
  maxDti?: number;
  maxDsr?: number;
  productMaxLoanKrw?: number;
  priceCapKrw?: number;
  acquisitionCostRate: number;
};

export type AffordabilityResult = {
  productType: ProductType;
  maxPurchasePriceKrw: number;
  estimatedMaxLoanKrw: number;
  requiredEquityKrw: number;
  monthlyRepaymentKrw: number;
  usableCashKrw: number;
  acquisitionCostKrw: number;
  limitReason: string;
  assumptions: LoanAssumptions;
  allLimitReasons: string[];
};

export type ApartmentSummary = {
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
  naverUrl: string;
};

export type SearchResultItem = ApartmentSummary & {
  budgetDeltaKrw: number;
  isAffordable: boolean;
  estimatedLoanNeedKrw: number;
  estimatedMonthlyRepaymentKrw: number;
};
