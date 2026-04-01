import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { normalizeAptTradeRow } from '../src/lib/server/public-data/apt-trades';

describe('public apt trade normalization', async () => {
  it('normalizes raw public trade row into krw-based transaction', async () => {
    const xml = fs.readFileSync(path.join(process.cwd(), 'test/fixtures/apt-trade-sample.xml'), 'utf8');
    const parsed = await parseStringPromise(xml);
    const row = parsed.response.body[0].items[0].item[0];
    const normalized = normalizeAptTradeRow({
      aptNm: row.aptNm[0],
      umdNm: row.umdNm[0],
      jibun: row.jibun[0],
      excluUseAr: row.excluUseAr[0],
      floor: row.floor[0],
      buildYear: row.buildYear[0],
      dealYear: row.dealYear[0],
      dealMonth: row.dealMonth[0],
      dealDay: row.dealDay[0],
      dealAmount: row.dealAmount[0]
    }, { regionCode: '11740', dealYearMonth: '202603' });

    expect(normalized.apartmentName).toBe('래미안 테스트');
    expect(normalized.tradePriceKrw).toBe(890000000);
    expect(normalized.dealDate).toBe('2026-03-18');
    expect(normalized.exclusiveAreaM2).toBeCloseTo(59.98);
  });
});
