import Link from 'next/link';
import { calculateAffordability, pickBestScenario } from '@/lib/server/calc';
import { searchAffordableApartments } from '@/lib/server/search';
import { financeInputSchema, searchFiltersSchema } from '@/lib/server/validators';
import { formatKrw, formatPercent } from '@/lib/server/format';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function normalize(params: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const params = normalize(await searchParams);
  const finance = financeInputSchema.parse(params);
  const filters = searchFiltersSchema.parse(params);
  const scenarios = calculateAffordability(finance);
  const best = pickBestScenario(scenarios);
  const results = searchAffordableApartments(filters, best);
  const affordableCount = results.filter((item) => item.isAffordable).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <section className="panel-hero">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">myapt result</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">실거래가 기준으로 바로 살펴본 결과</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">내 예산과 규칙 가정을 먼저 요약하고, 그 다음 실제 구매 가능 후보를 `단지 + 전용면적 타입` 단위로 보여준다.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="soft-light-button">입력 다시 하기</Link>
            <a href="#result-list" className="solid-light-button">결과 바로 보기</a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard title="내 최대 예산" value={formatKrw(best.maxPurchasePriceKrw)} desc={best.limitReason} tone="dark" />
          <MetricCard title="추정 최대 대출액" value={formatKrw(best.estimatedMaxLoanKrw)} desc={productLabel(best.assumptions.productType)} />
          <MetricCard title="예상 월 상환액" value={formatKrw(best.monthlyRepaymentKrw)} desc={`${best.assumptions.termMonths}개월 / ${best.assumptions.appliedInterestRatePct.toFixed(1)}%`} />
          <MetricCard title="구매 가능 후보" value={`${affordableCount}개`} desc={`전체 ${results.length}개 중`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-6">
            <section className="panel-card sticky-card">
              <PanelTitle title="왜 이 한도가 나왔는지" desc="실제 은행 심사 결과와 다를 수 있는 규칙 기반 추정이다." />
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
              <PanelTitle title="비교 시나리오" desc="현금, 일반 주담대, 정책모기지 중 어떤 시나리오가 유리한지 비교한다." />
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
            <PanelTitle title="구매 가능 후보" desc={`실거래가 기준 ${results.length}건 · 예산 이내 ${affordableCount}건`} />
            <div className="space-y-4">
              {results.map((item) => (
                <article key={`${item.complexId}-${item.exclusiveAreaM2}`} className="result-card">
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
                      <p className="text-xs leading-5 text-slate-500">네이버 링크는 외부 확인용이다. 구매 가능 여부 판단은 실거래가 기준이다.</p>
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

                  {item.isStale ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">최근 거래가 오래됐기 때문에 참고용에 가깝다. {item.staleReason ?? ''}</p> : null}
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value, desc, tone = 'light' }: { title: string; value: string; desc: string; tone?: 'light' | 'dark' }) {
  return (
    <section className={`metric-card ${tone === 'dark' ? 'dark' : ''}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{desc}</p>
    </section>
  );
}

function PanelTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {desc ? <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p> : null}
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-900">{value}</strong>
    </div>
  );
}

function ResultInfo({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-2 ${strong ? 'text-lg font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>{value}</p>
    </div>
  );
}

function productLabel(value: string) {
  if (value === 'GENERAL_MORTGAGE') return '일반 주담대';
  if (value === 'POLICY_MORTGAGE') return '정책모기지';
  if (value === 'CASH') return '현금만';
  return value;
}

function regionLabel(value: string) {
  if (value === 'CAPITAL') return '수도권';
  if (value === 'LOCAL') return '지방';
  if (value === 'REGULATED') return '규제지역';
  return value;
}
