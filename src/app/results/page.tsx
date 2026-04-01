import Link from 'next/link';
import { calculateAffordability, pickBestScenario } from '@/lib/server/calc';
import { searchAffordableApartments } from '@/lib/server/search';
import { financeInputSchema, searchFiltersSchema } from '@/lib/server/validators';
import { formatKrw, formatPercent } from '@/lib/server/format';
import { Card, SectionTitle } from '@/components/ui';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function normalize(params: Record<string, string | string[] | undefined>) {
  const normalized = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return normalized;
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const params = normalize(await searchParams);
  const finance = financeInputSchema.parse(params);
  const filters = searchFiltersSchema.parse(params);
  const scenarios = calculateAffordability(finance);
  const best = pickBestScenario(scenarios);
  const results = searchAffordableApartments(filters, best);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">myapt</p>
            <h1 className="text-3xl font-bold">실거래가 기준 결과</h1>
          </div>
          <Link href="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium">입력 수정</Link>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard title="내 최대 예산" value={formatKrw(best.maxPurchasePriceKrw)} desc={best.limitReason} />
          <SummaryCard title="추정 최대 대출액" value={formatKrw(best.estimatedMaxLoanKrw)} desc={best.assumptions.productType} />
          <SummaryCard title="예상 월 상환액" value={formatKrw(best.monthlyRepaymentKrw)} desc={`${best.assumptions.termMonths}개월 / ${best.assumptions.appliedInterestRatePct.toFixed(1)}%`} />
          <SummaryCard title="규칙 요약" value={best.assumptions.ruleVersion} desc={`${best.assumptions.regionKind} · LTV ${formatPercent(best.assumptions.maxLtv)}`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <SectionTitle title="적용 가정과 제한 사유" desc="실제 은행 심사 결과와 다를 수 있는 공식 규칙 기반 추정이다." />
            <ul className="grid gap-2 text-sm text-slate-700">
              <li>사용 가능 현금: <strong>{formatKrw(best.usableCashKrw)}</strong></li>
              <li>예상 취득 부대비용: <strong>{formatKrw(best.acquisitionCostKrw)}</strong></li>
              <li>금리 가정: <strong>{best.assumptions.appliedInterestRatePct.toFixed(1)}%</strong></li>
              <li>스트레스 적용 금리: <strong>{best.assumptions.stressAppliedRatePct.toFixed(1)}%</strong></li>
              <li>지역 구분: <strong>{best.assumptions.regionKind}</strong></li>
            </ul>
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">한도 제한 사유</p>
              <ul className="mt-2 list-disc pl-5">
                {best.allLimitReasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            </div>
          </Card>

          <Card>
            <SectionTitle title="검색 결과" desc={`실거래가 기준 ${results.length}건`} />
            <div className="grid gap-4">
              {results.map((item) => (
                <article key={`${item.complexId}-${item.exclusiveAreaM2}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.complexName} / 전용 {item.exclusiveAreaM2}㎡</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.address} · {item.householdCount ? `${item.householdCount.toLocaleString('ko-KR')}세대` : '세대수 미상'} · {item.completionYear ?? '준공연도 미상'}</p>
                    </div>
                    <a href={item.naverUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">네이버 부동산에서 보기</a>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                    <Info label="대표 실거래가" value={formatKrw(item.representativePriceKrw)} />
                    <Info label="최근 거래일" value={item.latestTradeDate} />
                    <Info label="최근 거래 건수" value={`${item.tradeCount}건`} />
                    <Info label="예산 대비" value={item.isAffordable ? `예산 이내 · ${formatKrw(item.budgetDeltaKrw)}` : `초과 · ${formatKrw(Math.abs(item.budgetDeltaKrw))}`} />
                    <Info label="추정 필요 대출액" value={formatKrw(item.estimatedLoanNeedKrw)} />
                    <Info label="예상 월 상환액" value={formatKrw(item.estimatedMonthlyRepaymentKrw)} />
                  </div>
                  {item.isStale ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">stale 데이터 · {item.staleReason ?? '최근 거래가 적다'}</p> : null}
                  {item.tradeCount <= 1 ? <p className="mt-2 text-xs text-slate-500">거래 적음 · 대표가격은 참고용이다.</p> : null}
                </article>
              ))}
            </div>
          </Card>
        </section>

        <Card>
          <SectionTitle title="비교 시나리오" desc="정책모기지, 일반 주담대, 현금 시나리오를 비교한다." />
          <div className="grid gap-3 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <div key={scenario.productType} className={`rounded-xl border p-4 ${scenario.productType === best.productType ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                <p className="text-sm font-semibold text-slate-700">{scenario.productType}</p>
                <p className="mt-2 text-2xl font-bold">{formatKrw(scenario.maxPurchasePriceKrw)}</p>
                <p className="mt-1 text-sm text-slate-600">{scenario.limitReason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

function SummaryCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return <Card className="p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-600">{desc}</p></Card>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
