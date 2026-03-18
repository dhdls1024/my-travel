// 카카오 지도 루트 컴포넌트 — 브라우저 전용 (use client 필수)
// next/script로 카카오 Maps JS API 로드 후 지도 초기화
"use client"

import type { Place } from "@/types/travel"

interface MapViewProps {
  // 지도에 표시할 장소 목록 (latitude/longitude 필수)
  places: Place[]
}

// TODO: Task007에서 구현 예정
// - next/script strategy="afterInteractive"로 카카오 SDK 로드
// - kakao.maps.load() 콜백에서 지도 초기화
// - 컨테이너에 고정 높이 필수 (height: 0이면 렌더링 안 됨)
// - fitBounds로 모든 마커가 보이도록 자동 줌/중심 조정
export default function MapView({ places }: MapViewProps) {
  return (
    <div>
      {/* 지도 컨테이너 — 고정 높이 필수 */}
      <div className="h-[500px] w-full rounded-lg bg-gray-100">
        <p className="flex h-full items-center justify-center text-gray-500">
          카카오 지도 영역 (장소 {places.length}개)
        </p>
      </div>
    </div>
  )
}
