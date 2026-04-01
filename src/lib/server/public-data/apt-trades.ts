import { parseStringPromise } from 'xml2js';
import type { FetchTradeParams, NormalizedAptTrade, RawAptTradeRow } from './types';

const APT_TRADE_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';

function compactSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function parsePriceToKrw(value: string) {
  const numeric = Number(value.replace(/,/g, '').trim());
  if (!Number.isFinite(numeric)) return 0;
  return numeric * 10_000;
}

function toNumber(value: unknown) {
  const num = Number(String(value ?? '').trim());
  return Number.isFinite(num) ? num : undefined;
}

export function normalizeAptTradeRow(row: RawAptTradeRow, params: Pick<FetchTradeParams, 'regionCode' | 'dealYearMonth'>): NormalizedAptTrade {
  const year = String(row.dealYear ?? params.dealYearMonth.slice(0, 4));
  const month = String(row.dealMonth ?? params.dealYearMonth.slice(4, 6)).padStart(2, '0');
  const day = String(row.dealDay ?? '01').padStart(2, '0');

  return {
    sourceRegionCode: params.regionCode,
    dealYearMonth: params.dealYearMonth,
    apartmentName: compactSpaces(String(row.aptNm ?? row.apartmentName ?? '')),
    legalDong: compactSpaces(String(row.umdNm ?? row.legalDong ?? '')),
    jibun: compactSpaces(String(row.jibun ?? '')),
    exclusiveAreaM2: Number(row.excluUseAr ?? row.exclusiveAreaM2 ?? 0),
    floor: toNumber(row.floor),
    builtYear: toNumber(row.buildYear),
    dealDate: `${year}-${month}-${day}`,
    tradePriceKrw: parsePriceToKrw(String(row.dealAmount ?? row.tradePrice ?? '0')),
    buyerCategory: row.sggCd ? String(row.sggCd) : undefined,
    sellerCategory: row.umdCd ? String(row.umdCd) : undefined,
    raw: row
  };
}

function extractRowsFromParsedXml(parsed: any): RawAptTradeRow[] {
  const items = parsed?.response?.body?.[0]?.items?.[0]?.item ?? [];
  return items.map((item: Record<string, unknown>) => {
    const out: RawAptTradeRow = {};
    for (const [key, value] of Object.entries(item)) {
      out[key] = Array.isArray(value) ? value[0] as string : value as string;
    }
    return out;
  });
}

export async function fetchAptTradesPage(params: FetchTradeParams, serviceKey = process.env.PUBLIC_DATA_API_KEY) {
  if (!serviceKey) throw new Error('PUBLIC_DATA_API_KEY is missing');
  const pageNo = params.page ?? 1;
  const numOfRows = params.pageSize ?? 1000;
  const url = new URL(APT_TRADE_URL);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('LAWD_CD', params.regionCode);
  url.searchParams.set('DEAL_YMD', params.dealYearMonth);
  url.searchParams.set('pageNo', String(pageNo));
  url.searchParams.set('numOfRows', String(numOfRows));

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`apt trade api failed: ${response.status}`);
  const xml = await response.text();
  const parsed = await parseStringPromise(xml);
  const rows = extractRowsFromParsedXml(parsed);
  const totalCount = Number(parsed?.response?.body?.[0]?.totalCount?.[0] ?? rows.length ?? 0);
  return {
    totalCount,
    pageNo,
    numOfRows,
    rows,
    normalized: rows.map((row) => normalizeAptTradeRow(row, params))
  };
}

export async function fetchAllAptTrades(params: Omit<FetchTradeParams, 'page'>, serviceKey = process.env.PUBLIC_DATA_API_KEY) {
  const first = await fetchAptTradesPage({ ...params, page: 1 }, serviceKey);
  const pages = Math.max(1, Math.ceil(first.totalCount / first.numOfRows));
  if (pages === 1) return first.normalized;

  const all: NormalizedAptTrade[] = [...first.normalized];
  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchAptTradesPage({ ...params, page }, serviceKey);
    all.push(...next.normalized);
  }
  return all;
}
