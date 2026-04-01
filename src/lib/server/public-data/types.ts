export type RawAptTradeRow = Record<string, string | number | null | undefined>;

export type NormalizedAptTrade = {
  sourceRegionCode: string;
  dealYearMonth: string;
  apartmentName: string;
  legalDong: string;
  jibun: string;
  exclusiveAreaM2: number;
  floor?: number;
  builtYear?: number;
  dealDate: string;
  tradePriceKrw: number;
  buyerCategory?: string;
  sellerCategory?: string;
  raw: RawAptTradeRow;
};

export type FetchTradeParams = {
  regionCode: string;
  dealYearMonth: string;
  page?: number;
  pageSize?: number;
};
