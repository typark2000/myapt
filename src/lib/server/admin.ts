import { getDefaultRuleSet } from './rules';

export function getAdminSummary() {
  const ruleSet = getDefaultRuleSet();
  return {
    ruleVersion: ruleSet.version,
    ruleName: ruleSet.name,
    acquisitionCostRate: ruleSet.acquisitionCostRate,
    baseRates: ruleSet.baseInterestRatePct,
    syncJobs: [
      { jobType: 'transactions', status: 'mock-ready', target: 'national', startedAt: '2026-04-01T12:00:00+09:00', message: '개발용 mock 데이터 사용 중' },
      { jobType: 'complex-metadata', status: 'mock-ready', target: 'national', startedAt: '2026-04-01T12:00:00+09:00', message: '공공데이터 연동 전 시드 상태' }
    ],
    mappingOverrides: []
  };
}
