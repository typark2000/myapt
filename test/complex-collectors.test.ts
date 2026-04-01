import { describe, expect, it } from 'vitest';
import { normalizeComplexListRow } from '../src/lib/server/public-data/collectors/complexes';
import { normalizeComplexDetailRow } from '../src/lib/server/public-data/collectors/complex-details';

describe('complex metadata collectors', () => {
  it('normalizes complex list row into candidate metadata', () => {
    const normalized = normalizeComplexListRow({
      kaptCode: 'A10001',
      kaptName: '래미안 테스트',
      sidoNm: '서울',
      sigunguNm: '강동구',
      legalDongNm: '천호동',
      address: '서울 강동구 천호동 100',
      kaptdaCnt: '912',
      useAprDay: '20181201',
      umdCd: '1174010900'
    });

    expect(normalized.sourceComplexCode).toBe('A10001');
    expect(normalized.householdCount).toBe(912);
    expect(normalized.completionYear).toBe(2018);
    expect(normalized.regionKind).toBe('CAPITAL');
  });

  it('normalizes complex detail row', () => {
    const detail = normalizeComplexDetailRow({
      kaptCode: 'A10001',
      kaptBcompany: '삼성물산',
      kaptdaCnt: '912',
      useAprDay: '20181201',
      parkingCnt: '1020',
      heatMethodType: '개별난방',
      codeHallNm: '계단식'
    });

    expect(detail.sourceComplexCode).toBe('A10001');
    expect(detail.builderName).toBe('삼성물산');
    expect(detail.parkingCount).toBe(1020);
  });
});
