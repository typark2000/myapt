import Link from 'next/link';
import { ResultsExplorer } from '@/components/results-explorer';
import { calculateAffordability, pickBestScenario } from '@/lib/server/calc';
import { searchAffordableApartments } from '@/lib/server/search';
import { financeInputSchema, searchFiltersSchema } from '@/lib/server/validators';

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

        <ResultsExplorer best={best} scenarios={scenarios} initialResults={results} />
      </div>
    </main>
  );
}
