import type { AffordabilityResult, ProductType, UserFinanceInput } from '@/lib/types';
import { getApplicableProducts, getBaseRate, getDefaultRuleSet } from './rules';

function monthlyPaymentForLoan(principal: number, annualRatePct: number, termMonths: number) {
  if (principal <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths)));
}

function maxLoanFromMonthlyBudget(monthlyBudget: number, annualRatePct: number, termMonths: number) {
  if (monthlyBudget <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return monthlyBudget * termMonths;
  return monthlyBudget * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate);
}

function annualDebtServiceToMonthly(input: UserFinanceInput) {
  if (input.existingMonthlyDebtServiceKrw) return input.existingMonthlyDebtServiceKrw;
  return Math.round((input.existingAnnualDebtServiceKrw ?? 0) / 12);
}

function regionIncomeMultiplier(regionKind: UserFinanceInput['desiredRegionKind']) {
  return regionKind === 'REGULATED' ? 0.33 : 0.4;
}

export function calculateAffordability(input: UserFinanceInput): AffordabilityResult[] {
  const ruleSet = getDefaultRuleSet();
  const baseRate = input.interestRatePct ?? getBaseRate(input.rateType);
  const totalIncome = input.annualIncomeKrw + (input.spouseIncomeKrw ?? 0);
  const existingMonthlyDebt = annualDebtServiceToMonthly(input);
  const emergencyFund = input.emergencyFundKrw ?? 0;
  const maxAffordableMonthly = Math.max(0, Math.round((totalIncome * regionIncomeMultiplier(input.desiredRegionKind)) / 12));
  const monthlyDebtLimit = Math.max(0, maxAffordableMonthly - existingMonthlyDebt);
  const terms = Math.min(input.desiredLoanTermMonths, 600);
  const products = input.loanScenario === 'CASH_ONLY'
    ? []
    : getApplicableProducts(input.desiredRegionKind, input.isFirstTimeBuyer).filter((product) => {
      if (input.loanScenario === 'GENERAL_ONLY') return product.productType === 'GENERAL_MORTGAGE';
      if (input.loanScenario === 'POLICY_ONLY') return product.productType === 'POLICY_MORTGAGE';
      return true;
    });

  const acquisitionCostRate = ruleSet.acquisitionCostRate;
  const cashOnlyUsable = Math.max(0, input.cashKrw - emergencyFund);
  const cashOnlyMaxPrice = Math.floor(cashOnlyUsable / (1 + acquisitionCostRate));
  const results: AffordabilityResult[] = [];

  if (input.loanScenario === 'CASH_ONLY' || input.loanScenario === 'COMPARE_ALL') {
    const acquisitionCostKrw = Math.round(cashOnlyMaxPrice * acquisitionCostRate);
    results.push({
      productType: 'CASH',
      maxPurchasePriceKrw: cashOnlyMaxPrice,
      estimatedMaxLoanKrw: 0,
      requiredEquityKrw: cashOnlyMaxPrice + acquisitionCostKrw,
      monthlyRepaymentKrw: 0,
      usableCashKrw: cashOnlyUsable,
      acquisitionCostKrw,
      limitReason: cashOnlyMaxPrice > 0 ? '현금 보유액이 한계' : '비상자금을 제외하면 사용할 현금이 부족함',
      assumptions: {
        ruleVersion: ruleSet.version,
        regionKind: input.desiredRegionKind,
        productType: 'CASH',
        appliedInterestRatePct: 0,
        stressAppliedRatePct: 0,
        termMonths: 0,
        maxLtv: 0,
        acquisitionCostRate
      },
      allLimitReasons: ['현금 기준']
    });
  }

  for (const product of products) {
    const stressedRate = baseRate + product.stressRateBps / 100;
    const dsrLoanCap = Math.floor(maxLoanFromMonthlyBudget(monthlyDebtLimit, stressedRate, Math.min(terms, product.maxTermMonths ?? terms)));
    const cappedLoan = Math.min(dsrLoanCap, product.productMaxLoanKrw ?? Number.MAX_SAFE_INTEGER);
    const usableCashBase = Math.max(0, input.cashKrw - emergencyFund);
    const ltvPriceCap = usableCashBase / (1 - product.maxLtv + acquisitionCostRate);
    const dsrPriceCap = usableCashBase + cappedLoan;
    const priceCap = Math.min(
      ltvPriceCap,
      dsrPriceCap,
      (product.priceCapKrw ?? Number.MAX_SAFE_INTEGER),
      usableCashBase + (product.productMaxLoanKrw ?? Number.MAX_SAFE_INTEGER)
    );
    const maxPurchasePriceKrw = Math.max(0, Math.floor(priceCap));
    const acquisitionCostKrw = Math.round(maxPurchasePriceKrw * acquisitionCostRate);
    const usableCash = Math.max(0, input.cashKrw - emergencyFund - acquisitionCostKrw);
    const requiredLoan = Math.max(0, maxPurchasePriceKrw - usableCash);
    const estimatedLoan = Math.min(requiredLoan, cappedLoan, product.productMaxLoanKrw ?? Number.MAX_SAFE_INTEGER);
    const monthlyRepaymentKrw = Math.round(monthlyPaymentForLoan(estimatedLoan, baseRate, Math.min(terms, product.maxTermMonths ?? terms)));

    const reasons: string[] = [];
    if (monthlyDebtLimit <= 0) reasons.push('기존 부채 때문에 추가 월 상환 여력이 없음');
    if (ltvPriceCap <= dsrPriceCap) reasons.push('LTV 제한'); else reasons.push('DSR 제한');
    if ((product.productMaxLoanKrw ?? Number.MAX_SAFE_INTEGER) < dsrLoanCap) reasons.push('상품 최대한도 제한');
    if (product.priceCapKrw && maxPurchasePriceKrw >= product.priceCapKrw) reasons.push('정책상품 가격 상한 제한');
    if (input.cashKrw <= emergencyFund) reasons.push('비상자금 설정으로 usable cash 감소');

    results.push({
      productType: product.productType,
      maxPurchasePriceKrw,
      estimatedMaxLoanKrw: Math.floor(estimatedLoan),
      requiredEquityKrw: Math.max(0, maxPurchasePriceKrw - estimatedLoan + acquisitionCostKrw),
      monthlyRepaymentKrw,
      usableCashKrw: Math.max(0, usableCash),
      acquisitionCostKrw,
      limitReason: reasons[0] ?? '종합 규칙 한도',
      assumptions: {
        ruleVersion: ruleSet.version,
        regionKind: input.desiredRegionKind,
        productType: product.productType,
        appliedInterestRatePct: baseRate,
        stressAppliedRatePct: stressedRate,
        termMonths: Math.min(terms, product.maxTermMonths ?? terms),
        maxLtv: product.maxLtv,
        maxDti: product.maxDti,
        maxDsr: product.maxDsr,
        productMaxLoanKrw: product.productMaxLoanKrw ?? undefined,
        priceCapKrw: product.priceCapKrw ?? undefined,
        acquisitionCostRate
      },
      allLimitReasons: reasons
    });
  }

  return results.sort((a, b) => b.maxPurchasePriceKrw - a.maxPurchasePriceKrw);
}

export function pickBestScenario(results: AffordabilityResult[]) {
  return [...results].sort((a, b) => b.maxPurchasePriceKrw - a.maxPurchasePriceKrw)[0];
}
