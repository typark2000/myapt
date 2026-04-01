export type ComplexMetaCandidate = {
  sourceComplexCode?: string;
  name: string;
  sido: string;
  sigungu: string;
  dong?: string;
  address: string;
  householdCount?: number;
  completionYear?: number;
  legalDongCode?: string;
  regionKind?: 'CAPITAL' | 'LOCAL' | 'REGULATED';
};

export function normalizeComplexName(name: string) {
  return name.replace(/\s+/g, '').replace(/\([^)]*\)/g, '').trim().toLowerCase();
}

export function buildComplexKey(input: { name: string; legalDong?: string; jibun?: string }) {
  return [normalizeComplexName(input.name), (input.legalDong ?? '').replace(/\s+/g, '').toLowerCase(), (input.jibun ?? '').replace(/\s+/g, '').toLowerCase()]
    .filter(Boolean)
    .join('::');
}
