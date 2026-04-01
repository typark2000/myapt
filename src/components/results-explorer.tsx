'use client';

import { useMemo, useState } from 'react';
import type { AffordabilityResult, SearchResultItem } from '@/lib/types';
import { formatKrw, formatPercent } from '@/lib/server/format';

type Props = {
  best: AffordabilityResult;
  scenarios: AffordabilityResult[];
  initialResults: SearchResultItem[];
};

type LocalSort = 'budgetClosest' | 'priceAsc' | 'latestTradeDesc' | 'completionYearAsc' | 'householdDesc';

export function ResultsExplorer({ best, scenarios, initialResults }: Props) {
  const [showAffordableOnly, setShowAffordableOnly] = useState(false);
  const [hideStale, setHideStale] = useState(false);
  const [minHouseholds, setMinHouseholds] = useState('');
  const [minCompletionYear, setMinCompletionYear] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [sortBy, setSortBy] = useState<LocalSort>('budgetClosest');

  const filteredResults = useMemo(() => {
    const minH = Number(minHouseholds || 0);
    const minY = Number(minCompletionYear || 0);
    const minA = Number(minArea || 0);
    const maxA = Number(maxArea || 9999);

    const items = initialResults.filter((item) => {
      if (showAffordableOnly && !item.isAffordable) return false;
      if (hideStale && item.isStale) return false;
      if (minH && (item.householdCount ?? 0) < minH) return false;
      if (minY && (item.completionYear ?? 0) < minY) return false;
      if (minA && item.exclusiveAreaM2 < minA) return false;
      if (maxA !== 9999 && item.exclusiveAreaM2 > maxA) return false;
      return true;
    });

    items.sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc': return a.representativePriceKrw - b.representativePriceKrw;
        case 'latestTradeDesc': return b.latestTradeDate.localeCompare(a.latestTradeDate);
        case 'completionYearAsc': return (a.completionYear ?? 9999) - (b.completionYear ?? 9999);
        case 'householdDesc': return (b.householdCount ?? 0) - (a.householdCount ?? 0);
        default: return Math.abs(a.budgetDeltaKrw) - Math.abs(b.budgetDeltaKrw);
      }
    });

    return items;
  }, [hideStale, initialResults, maxArea, minArea, minCompletionYear, minHouseholds, showAffordableOnly, sortBy]);

  const affordableCount = filteredResults.filter((item) => item.isAffordable).length;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard title="내 최대 예산" value={formatKrw(best.maxPurchasePriceKrw)} desc={best.limitReason} tone="dark" />
        <MetricCard title="추정 최대 대출액" value={formatKrw(best.estimatedMaxLoanKrw)} desc={productLabel(best.assumptions.productType)} />
        <MetricCard title="예상 월 상환액" value={formatKrw(best.monthlyRepaymentKrw)} desc={`${best.assumptions.termMonths}개월 / ${best.assumptions.appliedInterestRatePct.toFixed(1)}%`} />
        <MetricCard title="현재 후보" value={`${affordableCount}개`} desc={`필터 적용 후 ${filteredResults.length}개`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <section className="panel-card sticky-card">
            <PanelTitle title="왜 이 한도가 나왔는지" desc="실제 은행 심사 결과와 다를 수 있는 규칙 기반 추정입니다." />
            <div className="grid gap-3">
              <FactRow label="사용 가능 현금" value={formatKrw(best.usableCashKrw)} />
              <FactRow label="예상 취득 부대비용" value={formatKrw(best.acquisitionCostKrw)} />
              <FactRow label="적용 금리" value={`${best.assumptions.appliedInterestRatePct.toFixed(1)}%`} />
              <FactRow label="스트레스 적용 금리" value={`${best.assumptions.stressAppliedRatePct.toFixed(1)}%`} />
              <FactRow label="지역 구분" value={regionLabel(best.assumptions.regionKind)} />
              <FactRow label="규칙 버전" value={best.assumptions.ruleVersion} />
              <FactRow label="LTV" value={formatPercent(best.assumptions.maxLtv)} />
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">한도 제한 사유</p>
              <ul className="mt-3 space-y-2 text-sm text-amber-950">
                {best.allLimitReasons.map((reason) => <li key={reason} className="flex gap-2"><span>•</span><span>{reason}</span></li>)}
              </ul>
            </div>
          </section>

          <section className="panel-card">
            <PanelTitle title="비교 시나리오" desc="현금, 일반 주담대, 정책모기지 중 어떤 시나리오가 유리한지 비교해 드립니다." />
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {scenarios.map((scenario) => (
                <div key={scenario.productType} className={`scenario-card ${scenario.productType === best.productType ? 'active' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">{productLabel(scenario.productType)}</p>
                    {scenario.productType === best.productType ? <span className="badge-dark">최적</span> : null}
                  </div>
                  <p className="mt-3 text-2xl font-bold text-slate-950">{formatKrw(scenario.maxPurchasePriceKrw)}</p>
                  <p className="mt-2 text-sm text-slate-600">{scenario.limitReason}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section id="result-list" className="panel-card">
          <PanelTitle title="구매 가능 후보" desc="데모 모드에서는 추가 데이터 요청 없이 현재 결과 안에서 바로 필터링해 보실 수 있습니다." />

          <section className="filter-panel">
            <div className="filter-toggle-row">
              <button type="button" className={`filter-chip ${showAffordableOnly ? 'active' : ''}`} onClick={() => setShowAffordableOnly((v) => !v)}>예산 이내만 보기</button>
              <button type="button" className={`filter-chip ${hideStale ? 'active' : ''}`} onClick={() => setHideStale((v) => !v)}>오래된 거래 숨기기</button>
            </div>
            <div className="filter-grid">
              <label className="filter-field"><span>최소 세대수</span><input className="wizard-input" type="number" value={minHouseholds} onChange={(e) => setMinHouseholds(e.target.value)} placeholder="예: 500" /></label>
              <label className="filter-field"><span>최소 준공연도</span><input className="wizard-input" type="number" value={minCompletionYear} onChange={(e) => setMinCompletionYear(e.target.value)} placeholder="예: 2015" /></label>
              <label className="filter-field"><span>최소 전용면적</span><input className="wizard-input" type="number" value={minArea} onChange={(e) => setMinArea(e.target.value)} placeholder="예: 59" /></label>
              <label className="filter-field"><span>최대 전용면적</span><input className="wizard-input" type="number" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} placeholder="예: 84" /></label>
            </div>
            <label className="filter-field mt-3"><span>정렬</span>
              <select className="wizard-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as LocalSort)}>
                <option value="budgetClosest">예산에 가장 가까운 순</option>
                <option value="priceAsc">실거래가 낮은 순</option>
                <option value="latestTradeDesc">최근 거래일 최신순</option>
                <option value="completionYearAsc">연식순</option>
                <option value="householdDesc">세대수순</option>
              </select>
            </label>
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="badge-muted">현재 {filteredResults.length}개</span>
            <span className="badge-muted">예산 이내 {affordableCount}개</span>
          </div>

          <div className="mt-5 space-y-4">
            {filteredResults.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <p className="text-lg font-semibold text-slate-900">필터에 맞는 결과가 없습니다</p>
                <p className="mt-2 text-sm text-slate-500">세대수, 연식, 면적 조건을 조금 완화해서 다시 확인해 보세요.</p>
              </div>
            ) : filteredResults.map((item) => (
              <article key={`${item.complexId}-${item.exclusiveAreaM2}`} className="result-card card-appear">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-slate-950">{item.complexName}</h3>
                      <span className="badge-muted">전용 {item.exclusiveAreaM2}㎡</span>
                      <span className={item.isAffordable ? 'badge-good' : 'badge-warn'}>{item.isAffordable ? '예산 이내' : '예산 초과'}</span>
                      {item.isStale ? <span className="badge-stale">stale</span> : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.address}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.householdCount ? `${item.householdCount.toLocaleString('ko-KR')}세대` : '세대수 미상'} · {item.completionYear ?? '준공연도 미상'} · 최근 거래 {item.tradeCount}건</p>
                  </div>
                  <div className="flex flex-col gap-2 lg:min-w-[220px]">
                    <a href={item.naverUrl} target="_blank" rel="noreferrer" className="wizard-primary text-sm">네이버 부동산에서 보기</a>
                    <p className="text-xs leading-5 text-slate-500">데모에서는 현재 결과 집합 안에서만 인터랙션이 동작합니다.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <ResultInfo label="대표 실거래가" value={formatKrw(item.representativePriceKrw)} strong />
                  <ResultInfo label="최근 거래일" value={item.latestTradeDate} />
                  <ResultInfo label="예산 대비" value={item.isAffordable ? `${formatKrw(item.budgetDeltaKrw)} 여유` : `${formatKrw(Math.abs(item.budgetDeltaKrw))} 부족`} />
                  <ResultInfo label="추정 필요 대출액" value={formatKrw(item.estimatedLoanNeedKrw)} />
                  <ResultInfo label="예상 월 상환액" value={formatKrw(item.estimatedMonthlyRepaymentKrw)} />
                  <ResultInfo label="대표 거래 신뢰도" value={item.tradeCount <= 1 ? '거래 적음' : '최근 거래 중앙값'} />
                </div>

                {item.isStale ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">최근 거래가 오래되었기 때문에 참고용에 가깝습니다. {item.staleReason ?? ''}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}

function MetricCard({ title, value, desc, tone = 'light' }: { title: string; value: string; desc: string; tone?: 'light' | 'dark' }) {
  return <section className={`metric-card ${tone === 'dark' ? 'dark' : ''}`}><p className="text-sm text-slate-500">{title}</p><p className="mt-3 text-3xl font-bold tracking-tight">{value}</p><p className="mt-2 text-sm text-slate-500">{desc}</p></section>;
}
function PanelTitle({ title, desc }: { title: string; desc?: string }) { return <div className="mb-5"><h2 className="text-xl font-semibold text-slate-950">{title}</h2>{desc ? <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p> : null}</div>; }
function FactRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">{label}</span><strong className="text-right text-slate-900">{value}</strong></div>; }
function ResultInfo({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 ${strong ? 'text-lg font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>{value}</p></div>; }
function productLabel(value: string) { if (value === 'GENERAL_MORTGAGE') return '일반 주담대'; if (value === 'POLICY_MORTGAGE') return '정책모기지'; if (value === 'CASH') return '현금만'; return value; }
function regionLabel(value: string) { if (value === 'CAPITAL') return '수도권'; if (value === 'LOCAL') return '지방'; if (value === 'REGULATED') return '규제지역'; return value; }
