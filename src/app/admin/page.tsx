import { getAdminSummary } from '@/lib/server/admin';
import { formatPercent } from '@/lib/server/format';

export default function AdminPage() {
  const summary = getAdminSummary();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="panel-hero">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">myapt admin</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">규칙, 가정, 동기화 상태를 한 번에 본다</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">운영자가 지금 어떤 규칙으로 계산하고 있고, 데이터 파이프라인이 어느 단계에 있는지 빠르게 확인할 수 있는 최소 관리자 화면이다.</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard title="규칙 버전" value={summary.ruleVersion} desc={summary.ruleName} />
          <MetricCard title="취득 비용 가정" value={formatPercent(summary.acquisitionCostRate)} desc="구매 가능 현금 계산에 반영" />
          <MetricCard title="동기화 잡" value={`${summary.syncJobs.length}개`} desc="현재 추적 중인 배치" />
          <MetricCard title="매핑 override" value={`${summary.mappingOverrides.length}개`} desc="수동 개입 건수" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="panel-card">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-950">금리와 기본 가정</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">현재 화면과 계산 엔진에서 쓰는 기본 설정값이다.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(summary.baseRates).map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs text-slate-500">{key}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{value.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-950">동기화 상태</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">실거래, 단지 메타, 적재 배치의 현재 진행 상태를 여기서 확인한다.</p>
            </div>
            <div className="space-y-3">
              {summary.syncJobs.map((job) => (
                <div key={`${job.jobType}-${job.target}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{job.jobType}</p>
                    <span className={`badge-muted ${job.status === 'mock-ready' ? 'badge-neutral' : ''}`}>{job.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">대상: {job.target}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{job.message}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <section className="metric-card">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{desc}</p>
    </section>
  );
}
