export function formatKrw(value: number) {
  if (!Number.isFinite(value)) return '-';
  const abs = Math.abs(value);
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.round((abs % 100_000_000) / 10_000);
    return `${value < 0 ? '-' : ''}${eok}억 ${man.toLocaleString('ko-KR')}만원`;
  }
  if (abs >= 10_000) return `${value < 0 ? '-' : ''}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만원`;
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}
