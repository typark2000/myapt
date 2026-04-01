import { parsePublicXml, flattenXmlItems } from '../xml';
import type { ComplexMetaCandidate } from '../complex-metadata';

export type FetchComplexListParams = {
  regionCode?: string;
  page?: number;
  pageSize?: number;
};

export type RawComplexRow = Record<string, string>;

function pickRegionKind(address: string): ComplexMetaCandidate['regionKind'] {
  if (/서울|경기|인천/.test(address)) return 'CAPITAL';
  return 'LOCAL';
}

export function normalizeComplexListRow(row: RawComplexRow): ComplexMetaCandidate {
  const sido = row.sidoNm || row.sido || row.ctprvnNm || '';
  const sigungu = row.sigunguNm || row.sigungu || row.signguNm || '';
  const dong = row.legalDongNm || row.dong || row.emdNm || row.umdNm || undefined;
  const address = row.address || [sido, sigungu, dong, row.jibun].filter(Boolean).join(' ');

  return {
    sourceComplexCode: row.kaptCode || row.complexCode || row.housingComplexCode || undefined,
    name: (row.kaptName || row.complexName || row.aptName || '').trim(),
    sido: sido.trim(),
    sigungu: sigungu.trim(),
    dong: dong?.trim(),
    address: address.trim(),
    householdCount: row.householdCount ? Number(row.householdCount) : row.kaptdaCnt ? Number(row.kaptdaCnt) : undefined,
    completionYear: row.completionYear ? Number(row.completionYear) : row.useAprDay ? Number(String(row.useAprDay).slice(0, 4)) : undefined,
    legalDongCode: row.legalDongCode || row.umdCd || undefined,
    regionKind: pickRegionKind(address)
  };
}

export async function fetchComplexListPage(params: FetchComplexListParams, serviceKey = process.env.PUBLIC_DATA_API_KEY) {
  const endpoint = process.env.PUBLIC_COMPLEX_LIST_API_URL;
  if (!serviceKey) throw new Error('PUBLIC_DATA_API_KEY is missing');
  if (!endpoint) throw new Error('PUBLIC_COMPLEX_LIST_API_URL is missing');

  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('pageNo', String(params.page ?? 1));
  url.searchParams.set('numOfRows', String(params.pageSize ?? 100));
  if (params.regionCode) url.searchParams.set('LAWD_CD', params.regionCode);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`complex list api failed: ${response.status}`);
  const xml = await response.text();
  const parsed = await parsePublicXml(xml);
  const rows = flattenXmlItems(parsed);
  const totalCount = Number(parsed?.response?.body?.[0]?.totalCount?.[0] ?? rows.length ?? 0);
  return {
    totalCount,
    rows,
    normalized: rows.map(normalizeComplexListRow)
  };
}
