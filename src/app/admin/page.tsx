import { getAdminSummary } from '@/lib/server/admin';
import { formatPercent } from '@/lib/server/format';
import { Card, SectionTitle } from '@/components/ui';

export default function AdminPage() {
  const summary = getAdminSummary();
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-sky-700">myapt admin</p>
          <h1 className="text-3xl font-bold">규칙 / 설정 / 동기화 상태</h1>
        </div>
        <Card>
          <SectionTitle title="대출 규칙 버전" />
          <p className="text-lg font-semibold">{summary.ruleVersion}</p>
          <p className="mt-2 text-sm text-slate-600">{summary.ruleName}</p>
          <p className="mt-2 text-sm">취득 부대비용 가정: {formatPercent(summary.acquisitionCostRate)}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Object.entries(summary.baseRates).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{key}</strong><div>{value.toFixed(1)}%</div></div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="데이터 동기화 상태" />
          <div className="grid gap-3">
            {summary.syncJobs.map((job) => (
              <div key={`${job.jobType}-${job.target}`} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold">{job.jobType}</p>
                <p className="text-sm text-slate-600">상태: {job.status} / 대상: {job.target}</p>
                <p className="mt-1 text-sm text-slate-700">{job.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
