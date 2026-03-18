// 카카오 지도 관련 유틸리티
// 카카오 Maps JS API는 브라우저 전용 — 이 파일의 함수는 "use client" 컴포넌트에서만 호출하세요.

import type { Place } from "@/types/travel"
import { MARKER_COLORS } from "@/lib/constants"

// window.kakao 전역 타입 선언
// kakao.maps.d.ts 패키지가 설치되어 있으나,
// window.kakao 접근을 위해 전역 인터페이스에 kakao를 추가합니다.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any
  }
}

// 지도 마커 색상 상수 — CATEGORY_COLORS와 동일한 값, 지도 전용으로 재정의
// (constants.ts의 MARKER_COLORS를 직접 사용하므로 re-export)
export const MAP_MARKER_COLORS = MARKER_COLORS

// 위경도 좌표 타입
export interface LatLng {
  lat: number
  lng: number
}

// 유효 좌표 범위 — 한국 + 일본(오사카 등) 여행지 포함 범위
// 일본 오사카: 위도 34.x, 경도 135.x → 최댓값을 넉넉히 잡아 일본 포함
const KR_LAT_MIN = 33
const KR_LAT_MAX = 43
const KR_LNG_MIN = 124
const KR_LNG_MAX = 148

// Place 객체에서 위경도 좌표를 추출합니다.
// latitude/longitude가 없거나 유효 범위 밖이면 null 반환 (지도 마커 표시 제외)
export function placeToLatLng(place: Place): LatLng | null {
  if (place.latitude === undefined || place.longitude === undefined) return null

  const { latitude: lat, longitude: lng } = place

  // 유효 범위 검증 — 범위 밖 좌표는 Notion 데이터 오류로 간주하여 제외
  if (lat < KR_LAT_MIN || lat > KR_LAT_MAX) return null
  if (lng < KR_LNG_MIN || lng > KR_LNG_MAX) return null

  return { lat, lng }
}
