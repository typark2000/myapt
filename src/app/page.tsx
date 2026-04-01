import Link from 'next/link';

const sampleQuery = new URLSearchParams({
  age: '34', annualIncomeKrw: '85000000', spouseIncomeKrw: '45000000', householdType: 'COUPLE', cashKrw: '250000000', emergencyFundKrw: '30000000',
  existingAnnualDebtServiceKrw: '12000000', ownedHomeCount: '0', isFirstTimeBuyer: 'true', loanScenario: 'COMPARE_ALL', desiredLoanTermMonths: '360',
  rateType: 'MIXED', desiredRegionKind: 'CAPITAL', regionText: '서울', periodMonths: '12', sortBy: 'budgetClosest', staleMode: 'include'
}).toString();

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
        <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">myapt</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">내 소득과 현금으로 실제 어떤 아파트를 살 수 있는지</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">가격 기준은 반드시 아파트 매매 실거래가다. 호가가 아니라 최근 실거래를 기준으로, 단지 + 전용면적 타입 단위로 구매 가능 여부를 보여준다.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
            <span className="rounded-full bg-white/10 px-3 py-2">실거래가 기준</span>
            <span className="rounded-full bg-white/10 px-3 py-2">대출 규칙 엔진 기반 추정</span>
            <span className="rounded-full bg-white/10 px-3 py-2">네이버 부동산 바로가기</span>
          </div>
        </section>

        <form action="/results" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">내 예산 계산</h2>
            <p className="mt-2 text-sm text-slate-600">정확한 승인 결과가 아니라 공식 규칙 기반 추정이다. 어떤 제한이 적용되는지 결과에서 함께 설명한다.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="나이"><input name="age" type="number" defaultValue={34} className="input" /></Field>
              <Field label="연 소득(원)"><input name="annualIncomeKrw" type="number" defaultValue={85000000} className="input" /></Field>
              <Field label="배우자 소득(원)"><input name="spouseIncomeKrw" type="number" defaultValue={45000000} className="input" /></Field>
              <Field label="세대 구성">
                <select name="householdType" className="input"><option value="SINGLE">1인</option><option value="COUPLE" selected>부부</option><option value="FAMILY">가족</option></select>
              </Field>
              <Field label="현재 보유 현금(원)"><input name="cashKrw" type="number" defaultValue={250000000} className="input" /></Field>
              <Field label="남길 비상자금(원)"><input name="emergencyFundKrw" type="number" defaultValue={30000000} className="input" /></Field>
              <Field label="기존 연간 원리금 상환액(원)"><input name="existingAnnualDebtServiceKrw" type="number" defaultValue={12000000} className="input" /></Field>
              <Field label="보유 주택 수"><input name="ownedHomeCount" type="number" defaultValue={0} className="input" /></Field>
              <Field label="생애최초 여부">
                <select name="isFirstTimeBuyer" className="input"><option value="true" selected>예</option><option value="false">아니오</option></select>
              </Field>
              <Field label="대출 시나리오">
                <select name="loanScenario" className="input"><option value="CASH_ONLY">현금만</option><option value="GENERAL_ONLY">일반 주담대</option><option value="POLICY_ONLY">정책모기지</option><option value="COMPARE_ALL" selected>가능한 시나리오 모두 비교</option></select>
              </Field>
              <Field label="희망 만기(개월)"><input name="desiredLoanTermMonths" type="number" defaultValue={360} className="input" /></Field>
              <Field label="금리 유형">
                <select name="rateType" className="input"><option value="FIXED">고정</option><option value="MIXED" selected>혼합</option><option value="VARIABLE">변동</option></select>
              </Field>
              <Field label="직접 입력 금리(선택, %) "><input name="interestRatePct" type="number" step="0.1" placeholder="기본 설정값 사용" className="input" /></Field>
              <Field label="지역 구분">
                <select name="desiredRegionKind" className="input"><option value="CAPITAL" selected>수도권</option><option value="LOCAL">지방</option><option value="REGULATED">규제지역</option></select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">아파트 찾기</h2>
            <div className="mt-6 grid gap-4">
              <Field label="원하는 지역 / 키워드"><input name="regionText" defaultValue="서울" className="input" /></Field>
              <Field label="최소 세대수"><input name="minHouseholds" type="number" defaultValue={300} className="input" /></Field>
              <Field label="최대 세대수"><input name="maxHouseholds" type="number" placeholder="선택" className="input" /></Field>
              <Field label="최소 준공연도"><input name="minCompletionYear" type="number" defaultValue={2010} className="input" /></Field>
              <Field label="전용면적 최소(㎡)"><input name="minExclusiveAreaM2" type="number" defaultValue={59} className="input" /></Field>
              <Field label="전용면적 최대(㎡)"><input name="maxExclusiveAreaM2" type="number" defaultValue={84} className="input" /></Field>
              <Field label="최근 실거래 기간">
                <select name="periodMonths" className="input"><option value="3">3개월</option><option value="6">6개월</option><option value="12" selected>12개월</option><option value="24">24개월</option></select>
              </Field>
              <Field label="정렬">
                <select name="sortBy" className="input"><option value="budgetClosest" selected>예산에 가장 가까운 순</option><option value="priceAsc">실거래가 낮은 순</option><option value="latestTradeDesc">최근 거래일 최신순</option><option value="completionYearAsc">연식순</option><option value="householdDesc">세대수순</option></select>
              </Field>
              <Field label="오래된 거래 데이터">
                <select name="staleMode" className="input"><option value="include" selected>포함</option><option value="exclude">제외</option></select>
              </Field>
            </div>
            <button className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">실거래가 기준으로 계산하기</button>
            <Link href={`/results?${sampleQuery}`} className="mt-3 block text-center text-sm font-medium text-sky-700 underline">샘플 결과 바로 보기</Link>
          </section>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-700"><span>{label}</span>{children}</label>;
}
