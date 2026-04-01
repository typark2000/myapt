# MAPPING.md

## 목적
실거래 raw row를 서비스 검색 단위인 `단지 + 전용면적 타입`으로 묶기 위한 매핑 규칙을 정의한다.

## 현재 1차 구현
- 이름 정규화
- 법정동 + 지번 기반 complex key 생성
- 수동 override 우선
- exact key 매칭
- 이름 + 동 fallback 매칭
- area bucket(소수점 1자리) 기준 unit type 그룹핑

## 대표가격 산정
- 같은 `complex + exclusiveAreaM2` 그룹의 거래를 모아 median 계산
- 최신 거래일 저장
- 거래 건수 저장
- stale 여부 계산

## 다음 단계
- 공동주택 단지 목록 수집기 연결
- 공동주택 기본정보 수집기 연결
- 법정동 코드 기반 매핑 정교화
- 수동 override admin UI 연결


## 메타데이터 입력원
- 단지 목록 수집기에서 `ComplexMetaCandidate` 생성
- 단지 기본정보 수집기에서 builder / parking / 난방 등 상세 보강
- 이후 DB 적재 시 `Complex`, `ComplexMetadata`에 분리 저장
