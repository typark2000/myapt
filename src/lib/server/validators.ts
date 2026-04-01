import { z } from 'zod';

const booleanString = z.preprocess((value) => {
  if (value === true || value === 'true' || value === 'on' || value === '1') return true;
  if (value === false || value === 'false' || value === '0' || value === undefined || value === null || value === '') return false;
  return value;
}, z.boolean());

export const financeInputSchema = z.object({
  age: z.coerce.number().min(19).max(90).default(34),
  annualIncomeKrw: z.coerce.number().min(0).default(0),
  spouseIncomeKrw: z.coerce.number().min(0).optional().default(0),
  householdType: z.enum(['SINGLE', 'COUPLE', 'FAMILY']).default('SINGLE'),
  cashKrw: z.coerce.number().min(0).default(0),
  emergencyFundKrw: z.coerce.number().min(0).optional().default(0),
  existingAnnualDebtServiceKrw: z.coerce.number().min(0).optional().default(0),
  existingMonthlyDebtServiceKrw: z.coerce.number().min(0).optional().default(0),
  ownedHomeCount: z.coerce.number().min(0).max(5).default(0),
  isFirstTimeBuyer: booleanString.default(false),
  loanScenario: z.enum(['CASH_ONLY', 'GENERAL_ONLY', 'POLICY_ONLY', 'COMPARE_ALL']).default('COMPARE_ALL'),
  desiredLoanTermMonths: z.coerce.number().min(12).max(600).default(360),
  rateType: z.enum(['FIXED', 'MIXED', 'VARIABLE']).default('MIXED'),
  interestRatePct: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().min(0).max(20).optional()),
  desiredRegionKind: z.enum(['CAPITAL', 'LOCAL', 'REGULATED']).default('CAPITAL')
});

export const searchFiltersSchema = z.object({
  regionText: z.string().optional().default(''),
  minHouseholds: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().optional()),
  maxHouseholds: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().optional()),
  minCompletionYear: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().optional()),
  maxCompletionYear: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().optional()),
  minExclusiveAreaM2: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().optional()),
  maxExclusiveAreaM2: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().optional()),
  periodMonths: z.preprocess((value) => Number(value), z.union([z.literal(3), z.literal(6), z.literal(12), z.literal(24)])).default(12),
  sortBy: z.enum(['budgetClosest', 'priceAsc', 'latestTradeDesc', 'completionYearAsc', 'householdDesc']).default('budgetClosest'),
  staleMode: z.enum(['include', 'exclude']).default('include')
});
