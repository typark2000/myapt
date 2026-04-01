export function buildNaverSearchUrl(regionName: string, complexName: string) {
  const query = encodeURIComponent(`${regionName} ${complexName}`);
  return `https://new.land.naver.com/search?ms=37.5665,126.9780,15&a=APT&articleNo=&o=prc&kwd=${query}`;
}
