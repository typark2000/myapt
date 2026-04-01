import type { ApartmentSummary } from '@/lib/types';
import { buildNaverSearchUrl } from '@/lib/server/naver';

const items: ApartmentSummary[] = [
  {
    complexId: 'c1', complexName: '래미안 강동리버뷰', address: '서울특별시 강동구 천호동', regionName: '서울 강동구 천호동', householdCount: 912, completionYear: 2018,
    exclusiveAreaM2: 59, representativePriceKrw: 890000000, latestTradeDate: '2026-02-12', tradeCount: 4, isStale: false,
    naverUrl: buildNaverSearchUrl('서울 강동구 천호동', '래미안 강동리버뷰')
  },
  {
    complexId: 'c1-84', complexName: '래미안 강동리버뷰', address: '서울특별시 강동구 천호동', regionName: '서울 강동구 천호동', householdCount: 912, completionYear: 2018,
    exclusiveAreaM2: 84, representativePriceKrw: 1290000000, latestTradeDate: '2026-01-25', tradeCount: 3, isStale: false,
    naverUrl: buildNaverSearchUrl('서울 강동구 천호동', '래미안 강동리버뷰')
  },
  {
    complexId: 'c2', complexName: 'e편한세상 구로센트럴', address: '서울특별시 구로구 구로동', regionName: '서울 구로구 구로동', householdCount: 1220, completionYear: 2014,
    exclusiveAreaM2: 59, representativePriceKrw: 760000000, latestTradeDate: '2026-03-04', tradeCount: 5, isStale: false,
    naverUrl: buildNaverSearchUrl('서울 구로구 구로동', 'e편한세상 구로센트럴')
  },
  {
    complexId: 'c3', complexName: '힐스테이트 수원파크', address: '경기도 수원시 영통구 망포동', regionName: '경기 수원 영통구 망포동', householdCount: 842, completionYear: 2017,
    exclusiveAreaM2: 84, representativePriceKrw: 730000000, latestTradeDate: '2026-02-20', tradeCount: 4, isStale: false,
    naverUrl: buildNaverSearchUrl('경기 수원 영통구 망포동', '힐스테이트 수원파크')
  },
  {
    complexId: 'c4', complexName: '더샵 센텀포레', address: '부산광역시 해운대구 재송동', regionName: '부산 해운대구 재송동', householdCount: 1360, completionYear: 2020,
    exclusiveAreaM2: 84, representativePriceKrw: 680000000, latestTradeDate: '2025-11-15', tradeCount: 2, isStale: true, staleReason: '최근 거래가 4개월 이상 없음',
    naverUrl: buildNaverSearchUrl('부산 해운대구 재송동', '더샵 센텀포레')
  },
  {
    complexId: 'c5', complexName: '푸르지오 대전센터', address: '대전광역시 서구 둔산동', regionName: '대전 서구 둔산동', householdCount: 690, completionYear: 2011,
    exclusiveAreaM2: 59, representativePriceKrw: 420000000, latestTradeDate: '2026-01-09', tradeCount: 1, isStale: false,
    naverUrl: buildNaverSearchUrl('대전 서구 둔산동', '푸르지오 대전센터')
  }
];

export function getMockApartments() {
  return items;
}
