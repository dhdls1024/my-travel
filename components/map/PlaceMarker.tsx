// 카테고리별 색상 마커 컴포넌트 — 카카오 CustomOverlay로 렌더링
// 카카오 지도 위에 카테고리 색상별 마커를 표시
"use client"

import type { Place } from "@/types/travel"

interface PlaceMarkerProps {
  place: Place
  // 카카오 맵 인스턴스 (kakao.maps.Map)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any
}

// TODO: Task007에서 구현 예정
// - MARKER_COLORS 상수 기반 카테고리별 색상 마커
// - kakao.maps.CustomOverlay로 커스텀 마커 생성
// - 클릭 시 MarkerPopup 표시
export default function PlaceMarker({ place, map }: PlaceMarkerProps) {
  // 좌표가 없으면 렌더링하지 않음
  if (!place.latitude || !place.longitude) return null

  void map // TODO 구현 전 lint 경고 억제
  return null
}
