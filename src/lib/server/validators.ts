import { z } from 'zod';

export const financeInputSchema = z.object({
  age: z.coerce.number().min(19).max(90),
  annualIncomeKrw: z.coerce.number().min(0),
  spouseIncomeKrw: z.coerce.number().min(0).optional().default(0),
  householdType: z.enum(['SINGLE', 'COUPLE', 'FAMILY']),
  cashKrw: z.coerce.number().min(0),
  emergencyFundKrw: z.coerce.number().min(0).optional().default(0),
  existingAnnualDebtServiceKrw: z.coerce.number().min(0).optional().default(0),
  existingMonthlyDebtServiceKrw: z.coerce.number().min(0).optional().default(0),
  ownedHomeCount: z.coerce.number().min(0).max(5),
  isFirstTimeBuyer: z.coerce.boolean(),
  loanScenario: z.enum(['CASH_ONLY', 'GENERAL_ONLY', 'POLICY_ONLY', 'COMPARE_ALL']),
  desiredLoanTermMonths: z.coerce.number().min(12).max(600),
  rateType: z.enum(['FIXED', 'MIXED', 'VARIABLE']),
  interestRatePct: z.coerce.number().min(0).max(20).optional(),
  desiredRegionKind: z.enum(['CAPITAL', 'LOCAL', 'REGULATED'])
});

export const searchFiltersSchema = z.object({
  regionText: z.string().optional().default(''),
  minHouseholds: z.coerce.number().optional(),
  maxHouseholds: z.coerce.number().optional(),
  minCompletionYear: z.coerce.number().optional(),
  maxCompletionYear: z.coerce.number().optional(),
  minExclusiveAreaM2: z.coerce.number().optional(),
  maxExclusiveAreaM2: z.coerce.number().optional(),
  periodMonths: z.union([z.literal(3), z.literal(6), z.literal(12), z.literal(24)]).default(12),
  sortBy: z.enum(['budgetClosest', 'priceAsc', 'latestTradeDesc', 'completionYearAsc', 'householdDesc']).default('budgetClosest'),
  staleMode: z.enum(['include', 'exclude']).default('include')
});
