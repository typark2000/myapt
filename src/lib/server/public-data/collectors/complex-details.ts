export type ComplexDetail = {
  sourceComplexCode: string;
  builderName?: string;
  householdCount?: number;
  completionYear?: number;
  parkingCount?: number;
  heatingType?: string;
  managementType?: string;
  raw: Record<string, string>;
};

export function normalizeComplexDetailRow(row: Record<string, string>): ComplexDetail {
  return {
    sourceComplexCode: row.kaptCode || row.complexCode || row.housingComplexCode || '',
    builderName: row.kaptBcompany || row.builderName || undefined,
    householdCount: row.kaptdaCnt ? Number(row.kaptdaCnt) : row.householdCount ? Number(row.householdCount) : undefined,
    completionYear: row.useAprDay ? Number(String(row.useAprDay).slice(0, 4)) : row.completionYear ? Number(row.completionYear) : undefined,
    parkingCount: row.parkingCnt ? Number(row.parkingCnt) : undefined,
    heatingType: row.heatMethodType || undefined,
    managementType: row.codeHallNm || undefined,
    raw: row
  };
}

export async function fetchComplexDetail(sourceComplexCode: string, serviceKey = process.env.PUBLIC_DATA_API_KEY) {
  const endpoint = process.env.PUBLIC_COMPLEX_DETAIL_API_URL;
  if (!serviceKey) throw new Error('PUBLIC_DATA_API_KEY is missing');
  if (!endpoint) throw new Error('PUBLIC_COMPLEX_DETAIL_API_URL is missing');

  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('kaptCode', sourceComplexCode);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`complex detail api failed: ${response.status}`);
  const json = await response.json();
  const row = (json?.data?.[0] ?? json?.items?.[0] ?? json ?? {}) as Record<string, string>;
  return normalizeComplexDetailRow(row);
}
