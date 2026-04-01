import type { NormalizedAptTrade } from '@/lib/server/public-data/types';
import type { ComplexMetaCandidate } from '@/lib/server/public-data/complex-metadata';
import { buildApartmentSummariesFromData } from '@/lib/server/mapping/transaction-mapper';

const mockComplexes: ComplexMetaCandidate[] = [
  { sourceComplexCode: 'c1', name: '래미안 강동리버뷰', sido: '서울', sigungu: '강동구', dong: '천호동', address: '서울특별시 강동구 천호동', householdCount: 912, completionYear: 2018, regionKind: 'CAPITAL' },
  { sourceComplexCode: 'c2', name: 'e편한세상 구로센트럴', sido: '서울', sigungu: '구로구', dong: '구로동', address: '서울특별시 구로구 구로동', householdCount: 1220, completionYear: 2014, regionKind: 'CAPITAL' },
  { sourceComplexCode: 'c3', name: '힐스테이트 수원파크', sido: '경기', sigungu: '수원시 영통구', dong: '망포동', address: '경기도 수원시 영통구 망포동', householdCount: 842, completionYear: 2017, regionKind: 'CAPITAL' },
  { sourceComplexCode: 'c4', name: '더샵 센텀포레', sido: '부산', sigungu: '해운대구', dong: '재송동', address: '부산광역시 해운대구 재송동', householdCount: 1360, completionYear: 2020, regionKind: 'LOCAL' },
  { sourceComplexCode: 'c5', name: '푸르지오 대전센터', sido: '대전', sigungu: '서구', dong: '둔산동', address: '대전광역시 서구 둔산동', householdCount: 690, completionYear: 2011, regionKind: 'LOCAL' }
];

const mockTrades: NormalizedAptTrade[] = [
  { sourceRegionCode: '11740', dealYearMonth: '202603', apartmentName: '래미안 강동리버뷰', legalDong: '천호동', jibun: '100', exclusiveAreaM2: 59, dealDate: '2026-02-12', tradePriceKrw: 890000000, raw: {} },
  { sourceRegionCode: '11740', dealYearMonth: '202603', apartmentName: '래미안 강동리버뷰', legalDong: '천호동', jibun: '100', exclusiveAreaM2: 59, dealDate: '2026-01-15', tradePriceKrw: 905000000, raw: {} },
  { sourceRegionCode: '11740', dealYearMonth: '202603', apartmentName: '래미안 강동리버뷰', legalDong: '천호동', jibun: '100', exclusiveAreaM2: 84, dealDate: '2026-01-25', tradePriceKrw: 1290000000, raw: {} },
  { sourceRegionCode: '11530', dealYearMonth: '202603', apartmentName: 'e편한세상 구로센트럴', legalDong: '구로동', jibun: '200', exclusiveAreaM2: 59, dealDate: '2026-03-04', tradePriceKrw: 760000000, raw: {} },
  { sourceRegionCode: '11530', dealYearMonth: '202603', apartmentName: 'e편한세상 구로센트럴', legalDong: '구로동', jibun: '200', exclusiveAreaM2: 59, dealDate: '2026-02-10', tradePriceKrw: 750000000, raw: {} },
  { sourceRegionCode: '41117', dealYearMonth: '202603', apartmentName: '힐스테이트 수원파크', legalDong: '망포동', jibun: '300', exclusiveAreaM2: 84, dealDate: '2026-02-20', tradePriceKrw: 730000000, raw: {} },
  { sourceRegionCode: '26350', dealYearMonth: '202511', apartmentName: '더샵 센텀포레', legalDong: '재송동', jibun: '400', exclusiveAreaM2: 84, dealDate: '2025-11-15', tradePriceKrw: 680000000, raw: {} },
  { sourceRegionCode: '30170', dealYearMonth: '202601', apartmentName: '푸르지오 대전센터', legalDong: '둔산동', jibun: '500', exclusiveAreaM2: 59, dealDate: '2026-01-09', tradePriceKrw: 420000000, raw: {} }
];

export function getMockTrades() {
  return mockTrades;
}

export function getMockComplexes() {
  return mockComplexes;
}

export function getMockApartments(periodMonths = 12) {
  return buildApartmentSummariesFromData({
    trades: mockTrades,
    complexes: mockComplexes,
    periodMonths,
    now: new Date('2026-04-01T00:00:00+09:00')
  });
}
