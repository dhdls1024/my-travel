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

// Place 객체에서 위경도 좌표를 추출합니다.
// latitude/longitude가 없는 장소는 null을 반환 (지도 마커 표시 제외)
export function placeToLatLng(place: Place): LatLng | null {
  // TODO: 좌표 유효성 검증 추가 (범위: 위도 33~38, 경도 124~132 대한민국 기준)
  if (place.latitude === undefined || place.longitude === undefined) {
    return null
  }
  return { lat: place.latitude, lng: place.longitude }
}
