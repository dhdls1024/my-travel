// PlaceMarker — 카카오 CustomOverlay 마커 HTML 생성 유틸리티
// MapView에서 직접 마커 DOM을 생성하므로 독립 React 컴포넌트로는 사용하지 않음
// 마커 스타일 변경 시 이 파일의 createMarkerContent만 수정하면 됨
"use client"

import type { Place } from "@/types/travel"
import { MARKER_COLORS } from "@/lib/constants"

interface PlaceMarkerProps {
  place: Place
  // 카카오 맵 인스턴스 (kakao.maps.Map)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any
}

// createMarkerContent — 카테고리 컬러 원형 마커 + 장소 이름 라벨 HTML 문자열 생성
// kakao.maps.CustomOverlay의 content 속성에 직접 삽입하여 사용
// data-place-id 속성: MapView에서 DOM 클릭 이벤트 바인딩 시 마커를 특정하는 데 사용
// 구조: 최상위 flex 컨테이너(column) → 이름 라벨(위) → 원형 dot(아래)
export function createMarkerContent(place: Place): string {
  const color = MARKER_COLORS[place.category]
  return `
    <div style="
      display:flex; flex-direction:column; align-items:center;
      cursor:pointer;
    " data-place-id="${place.id}">
      <div style="
        font-size:10px; color:#333; background:#fff;
        padding:2px 4px; border-radius:4px;
        box-shadow:0 1px 4px rgba(0,0,0,0.2);
        text-align:center; margin-bottom:2px;
        max-width:70px; overflow:hidden;
        text-overflow:ellipsis; white-space:nowrap;
      ">${place.name}</div>
      <div style="
        width:28px; height:28px; border-radius:50%;
        background:${color}; border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex; align-items:center; justify-content:center;
      ">
        <div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>
      </div>
    </div>
  `
}

// default export 유지 — 기존 import 구문 깨짐 방지
// 실제 마커 렌더링은 MapView에서 kakao.maps.CustomOverlay로 처리
export default function PlaceMarker({ place, map }: PlaceMarkerProps) {
  if (!place.latitude || !place.longitude) return null
  void map
  return null
}
