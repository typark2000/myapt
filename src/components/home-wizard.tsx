'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type FormState = {
  annualIncomeKrw: string;
  age: string;
  hasSpouse: 'yes' | 'no';
  spouseIncomeKrw: string;
  cashKrw: string;
  emergencyFundKrw: string;
  existingAnnualDebtServiceKrw: string;
  ownedHomeCount: string;
  isFirstTimeBuyer: 'true' | 'false';
  loanScenario: 'CASH_ONLY' | 'GENERAL_ONLY' | 'POLICY_ONLY' | 'COMPARE_ALL';
  desiredLoanTermMonths: string;
  rateType: 'FIXED' | 'MIXED' | 'VARIABLE';
  interestRatePct: string;
  desiredRegionKind: 'CAPITAL' | 'LOCAL' | 'REGULATED';
  regionText: string;
  minHouseholds: string;
  maxHouseholds: string;
  minCompletionYear: string;
  minExclusiveAreaM2: string;
  maxExclusiveAreaM2: string;
  periodMonths: '3' | '6' | '12' | '24';
  sortBy: 'budgetClosest' | 'priceAsc' | 'latestTradeDesc' | 'completionYearAsc' | 'householdDesc';
  staleMode: 'include' | 'exclude';
};

const defaultState: FormState = {
  annualIncomeKrw: '85000000',
  age: '34',
  hasSpouse: 'yes',
  spouseIncomeKrw: '45000000',
  cashKrw: '250000000',
  emergencyFundKrw: '30000000',
  existingAnnualDebtServiceKrw: '12000000',
  ownedHomeCount: '0',
  isFirstTimeBuyer: 'true',
  loanScenario: 'COMPARE_ALL',
  desiredLoanTermMonths: '360',
  rateType: 'MIXED',
  interestRatePct: '',
  desiredRegionKind: 'CAPITAL',
  regionText: '서울',
  minHouseholds: '300',
  maxHouseholds: '',
  minCompletionYear: '2010',
  minExclusiveAreaM2: '59',
  maxExclusiveAreaM2: '84',
  periodMonths: '12',
  sortBy: 'budgetClosest',
  staleMode: 'include'
};

const sampleQuery = new URLSearchParams({
  age: '34', annualIncomeKrw: '85000000', spouseIncomeKrw: '45000000', householdType: 'COUPLE', cashKrw: '250000000', emergencyFundKrw: '30000000',
  existingAnnualDebtServiceKrw: '12000000', ownedHomeCount: '0', isFirstTimeBuyer: 'true', loanScenario: 'COMPARE_ALL', desiredLoanTermMonths: '360',
  rateType: 'MIXED', desiredRegionKind: 'CAPITAL', regionText: '서울', periodMonths: '12', sortBy: 'budgetClosest', staleMode: 'include', minHouseholds: '300', minCompletionYear: '2010', minExclusiveAreaM2: '59', maxExclusiveAreaM2: '84'
}).toString();

export function HomeWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(defaultState);
  const [stepDirection, setStepDirection] = useState<'next' | 'prev'>('next');

  const steps = useMemo(() => {
    const base = [
      { key: 'annualIncomeKrw', title: '연봉을 알려주세요', desc: '세전 연 소득 기준으로 입력하면 된다.', render: numberInput('annualIncomeKrw', '예: 85000000') },
      { key: 'age', title: '나이를 알려주세요', desc: '만 나이 기준이면 충분하다.', render: numberInput('age', '예: 34') },
      { key: 'hasSpouse', title: '배우자가 있으신가요?', desc: '배우자 소득이 있으면 함께 계산할 수 있다.', render: spouseToggle },
      ...(form.hasSpouse === 'yes' ? [{ key: 'spouseIncomeKrw', title: '배우자 연봉은 얼마인가요?', desc: '없으면 0으로 둘 수 있다.', render: numberInput('spouseIncomeKrw', '예: 45000000') }] : []),
      { key: 'cashKrw', title: '현재 보유 현금은 얼마인가요?', desc: '주택 구매에 투입 가능한 전체 현금을 입력해달라.', render: numberInput('cashKrw', '예: 250000000') },
      { key: 'emergencyFundKrw', title: '남겨둘 비상자금은 얼마인가요?', desc: '0도 가능하다. 남길 돈이 있으면 더 보수적으로 계산한다.', render: numberInput('emergencyFundKrw', '예: 30000000') },
      { key: 'existingAnnualDebtServiceKrw', title: '기존 연간 원리금 상환액은 얼마인가요?', desc: '기존 대출이 없으면 0으로 입력하면 된다.', render: numberInput('existingAnnualDebtServiceKrw', '예: 12000000') },
      { key: 'ownedHomeCount', title: '현재 보유 주택 수는 몇 채인가요?', desc: '무주택 / 1주택 / 다주택 판단에 사용된다.', render: numberInput('ownedHomeCount', '예: 0') },
      { key: 'isFirstTimeBuyer', title: '생애최초 주택구입이신가요?', desc: '정책모기지나 LTV 완화 판단에 반영된다.', render: firstTimeToggle },
      { key: 'loanScenario', title: '대출 시나리오는 어떻게 볼까요?', desc: '현금만, 일반 주담대, 정책모기지, 모두 비교 중 선택 가능하다.', render: loanScenarioSelect },
      { key: 'desiredLoanTermMonths', title: '희망 대출 만기는 몇 개월인가요?', desc: '보통 360개월(30년)이나 420개월 이상을 많이 본다.', render: numberInput('desiredLoanTermMonths', '예: 360') },
      { key: 'rateType', title: '금리 유형은 무엇으로 볼까요?', desc: '기본 금리를 쓰되 원하면 직접 금리도 넣을 수 있다.', render: rateTypeSelect },
      { key: 'desiredRegionKind', title: '먼저 지역 구분을 고를까요?', desc: '수도권 / 지방 / 규제지역에 따라 규칙이 달라진다.', render: regionKindSelect },
      { key: 'regionText', title: '어느 지역을 보고 싶나요?', desc: '시/군/구나 동, 혹은 키워드로 입력하면 된다.', render: textInput('regionText', '예: 서울 강동구') },
      { key: 'minExclusiveAreaM2', title: '최소 전용면적은 어느 정도가 좋나요?', desc: '면적 타입 단위로 결과를 보여주기 때문에 중요하다.', render: areaRangeInputs },
      { key: 'minCompletionYear', title: '연식이나 세대수 조건도 걸까요?', desc: '원하면 최소 준공연도와 세대수 기준을 함께 볼 수 있다.', render: buildingFilterInputs },
      { key: 'periodMonths', title: '최근 실거래 반영 기간은 얼마나 볼까요?', desc: '기본 12개월을 추천한다.', render: periodAndSortInputs }
    ];
    return base;
  }, [form.hasSpouse]);

  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStepDirection('next');
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prev() {
    setStepDirection('prev');
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function numberInput(key: keyof FormState, placeholder: string) {
    return () => <input className="wizard-input" type="number" name={key} value={form[key]} placeholder={placeholder} onChange={(e) => update(key, e.target.value as FormState[typeof key])} />;
  }

  function textInput(key: keyof FormState, placeholder: string) {
    return () => <input className="wizard-input" type="text" name={key} value={form[key]} placeholder={placeholder} onChange={(e) => update(key, e.target.value as FormState[typeof key])} />;
  }

  function spouseToggle() {
    return (
      <div className="wizard-option-grid">
        <button type="button" className={optionClass(form.hasSpouse === 'yes')} onClick={() => update('hasSpouse', 'yes')}>예, 같이 계산할게요</button>
        <button type="button" className={optionClass(form.hasSpouse === 'no')} onClick={() => update('hasSpouse', 'no')}>아니요, 혼자예요</button>
      </div>
    );
  }

  function firstTimeToggle() {
    return (
      <div className="wizard-option-grid">
        <button type="button" className={optionClass(form.isFirstTimeBuyer === 'true')} onClick={() => update('isFirstTimeBuyer', 'true')}>예</button>
        <button type="button" className={optionClass(form.isFirstTimeBuyer === 'false')} onClick={() => update('isFirstTimeBuyer', 'false')}>아니오</button>
      </div>
    );
  }

  function loanScenarioSelect() {
    return (
      <div className="wizard-option-grid single-col">
        {[
          ['COMPARE_ALL', '가능한 시나리오 모두 비교'],
          ['GENERAL_ONLY', '일반 주담대만'],
          ['POLICY_ONLY', '정책모기지 중심'],
          ['CASH_ONLY', '현금만']
        ].map(([value, label]) => (
          <button key={value} type="button" className={optionClass(form.loanScenario === value)} onClick={() => update('loanScenario', value as FormState['loanScenario'])}>{label}</button>
        ))}
      </div>
    );
  }

  function rateTypeSelect() {
    return (
      <div className="space-y-3">
        <div className="wizard-option-grid">
          {[
            ['FIXED', '고정'],
            ['MIXED', '혼합'],
            ['VARIABLE', '변동']
          ].map(([value, label]) => (
            <button key={value} type="button" className={optionClass(form.rateType === value)} onClick={() => update('rateType', value as FormState['rateType'])}>{label}</button>
          ))}
        </div>
        <input className="wizard-input" type="number" step="0.1" value={form.interestRatePct} placeholder="직접 금리 입력(선택, 예: 4.1)" onChange={(e) => update('interestRatePct', e.target.value)} />
      </div>
    );
  }

  function regionKindSelect() {
    return (
      <div className="wizard-option-grid">
        {[
          ['CAPITAL', '수도권'],
          ['LOCAL', '지방'],
          ['REGULATED', '규제지역']
        ].map(([value, label]) => (
          <button key={value} type="button" className={optionClass(form.desiredRegionKind === value)} onClick={() => update('desiredRegionKind', value as FormState['desiredRegionKind'])}>{label}</button>
        ))}
      </div>
    );
  }

  function areaRangeInputs() {
    return (
      <div className="wizard-split-grid">
        <input className="wizard-input" type="number" value={form.minExclusiveAreaM2} placeholder="최소 전용면적" onChange={(e) => update('minExclusiveAreaM2', e.target.value)} />
        <input className="wizard-input" type="number" value={form.maxExclusiveAreaM2} placeholder="최대 전용면적" onChange={(e) => update('maxExclusiveAreaM2', e.target.value)} />
      </div>
    );
  }

  function buildingFilterInputs() {
    return (
      <div className="wizard-split-grid">
        <input className="wizard-input" type="number" value={form.minCompletionYear} placeholder="최소 준공연도" onChange={(e) => update('minCompletionYear', e.target.value)} />
        <input className="wizard-input" type="number" value={form.minHouseholds} placeholder="최소 세대수" onChange={(e) => update('minHouseholds', e.target.value)} />
      </div>
    );
  }

  function periodAndSortInputs() {
    return (
      <div className="space-y-3">
        <div className="wizard-option-grid">
          {[
            ['3', '3개월'],
            ['6', '6개월'],
            ['12', '12개월'],
            ['24', '24개월']
          ].map(([value, label]) => (
            <button key={value} type="button" className={optionClass(form.periodMonths === value)} onClick={() => update('periodMonths', value as FormState['periodMonths'])}>{label}</button>
          ))}
        </div>
        <select className="wizard-input" value={form.sortBy} onChange={(e) => update('sortBy', e.target.value as FormState['sortBy'])}>
          <option value="budgetClosest">예산에 가장 가까운 순</option>
          <option value="priceAsc">실거래가 낮은 순</option>
          <option value="latestTradeDesc">최근 거래일 최신순</option>
          <option value="completionYearAsc">연식순</option>
          <option value="householdDesc">세대수순</option>
        </select>
        <select className="wizard-input" value={form.staleMode} onChange={(e) => update('staleMode', e.target.value as FormState['staleMode'])}>
          <option value="include">오래된 거래도 포함</option>
          <option value="exclude">오래된 거래는 제외</option>
        </select>
      </div>
    );
  }

  function optionClass(active: boolean) {
    return `wizard-option ${active ? 'active' : ''}`;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6">
        <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">myapt</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">질문에 답하면 내 예산과 살 수 있는 아파트를 바로 보여줄게</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">복잡한 폼 대신 하나씩 묻는다. 가격 기준은 실거래가고, 결과는 단지 + 전용면적 타입으로 보여준다.</p>
        </section>

        <form action="/results" className="space-y-6">
          <input type="hidden" name="annualIncomeKrw" value={form.annualIncomeKrw} />
          <input type="hidden" name="age" value={form.age} />
          <input type="hidden" name="spouseIncomeKrw" value={form.hasSpouse === 'yes' ? form.spouseIncomeKrw : '0'} />
          <input type="hidden" name="householdType" value={form.hasSpouse === 'yes' ? 'COUPLE' : 'SINGLE'} />
          <input type="hidden" name="cashKrw" value={form.cashKrw} />
          <input type="hidden" name="emergencyFundKrw" value={form.emergencyFundKrw} />
          <input type="hidden" name="existingAnnualDebtServiceKrw" value={form.existingAnnualDebtServiceKrw} />
          <input type="hidden" name="ownedHomeCount" value={form.ownedHomeCount} />
          <input type="hidden" name="isFirstTimeBuyer" value={form.isFirstTimeBuyer} />
          <input type="hidden" name="loanScenario" value={form.loanScenario} />
          <input type="hidden" name="desiredLoanTermMonths" value={form.desiredLoanTermMonths} />
          <input type="hidden" name="rateType" value={form.rateType} />
          <input type="hidden" name="interestRatePct" value={form.interestRatePct} />
          <input type="hidden" name="desiredRegionKind" value={form.desiredRegionKind} />
          <input type="hidden" name="regionText" value={form.regionText} />
          <input type="hidden" name="minHouseholds" value={form.minHouseholds} />
          <input type="hidden" name="maxHouseholds" value={form.maxHouseholds} />
          <input type="hidden" name="minCompletionYear" value={form.minCompletionYear} />
          <input type="hidden" name="minExclusiveAreaM2" value={form.minExclusiveAreaM2} />
          <input type="hidden" name="maxExclusiveAreaM2" value={form.maxExclusiveAreaM2} />
          <input type="hidden" name="periodMonths" value={form.periodMonths} />
          <input type="hidden" name="sortBy" value={form.sortBy} />
          <input type="hidden" name="staleMode" value={form.staleMode} />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-sky-700">질문 {step + 1} / {steps.length}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{current.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{current.desc}</p>
              </div>
              <div className="hidden text-right md:block">
                <p className="text-sm text-slate-500">진행률</p>
                <p className="text-3xl font-bold text-slate-900">{progress}%</p>
              </div>
            </div>

            <div className="mb-6 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div key={current.key} className={`min-h-[140px] wizard-step-shell ${stepDirection === 'next' ? 'enter-next' : 'enter-prev'}`}>{current.render()}</div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={prev} disabled={step === 0} className="wizard-secondary">이전</button>
              {step < steps.length - 1 ? (
                <button type="button" onClick={next} className="wizard-primary">다음 질문</button>
              ) : (
                <button type="submit" className="wizard-primary">실거래가 기준으로 계산하기</button>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">현재 입력 요약</p>
                <p className="mt-1 text-sm text-slate-500">입력한 값은 마지막 결과 페이지에서 다시 검토할 수 있다.</p>
              </div>
              <Link href={`/results?${sampleQuery}`} className="text-sm font-medium text-sky-700 underline">샘플 결과 바로 보기</Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <SummaryChip label="연봉" value={toWon(form.annualIncomeKrw)} />
              <SummaryChip label="현금" value={toWon(form.cashKrw)} />
              <SummaryChip label="지역" value={form.regionText || '미입력'} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">지금은 질문 하나씩 답하면 되고, 복잡한 금융 규칙은 뒤에서 정리해서 보여준다.</p>
          </section>
        </form>
      </div>
    </main>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>;
}

function toWon(value: string) {
  if (!value) return '미입력';
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  if (num >= 100_000_000) {
    const eok = Math.floor(num / 100_000_000);
    const man = Math.round((num % 100_000_000) / 10_000);
    return `${eok}억 ${man.toLocaleString('ko-KR')}만원`;
  }
  return `${Math.round(num / 10000).toLocaleString('ko-KR')}만원`;
}
