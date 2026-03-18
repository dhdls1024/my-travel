// MapViewWrapper — dynamic ssr:false를 클라이언트 컴포넌트에서 처리
// Next.js App Router: 서버 컴포넌트에서 ssr:false 사용 불가 → 클라이언트 래퍼로 분리
"use client"

import dynamic from "next/dynamic"

import type { Place } from "@/types/travel"

// 카카오 SDK는 브라우저 전용 — SSR 환경에서 window 접근 방지를 위해 ssr:false
const MapViewDynamic = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    // 지도 로딩 중 플레이스홀더 — 동일한 높이 유지하여 레이아웃 시프트 방지
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-muted-foreground text-sm">지도를 불러오는 중...</p>
    </div>
  ),
})

interface MapViewWrapperProps {
  places: Place[]
}

export default function MapViewWrapper({ places }: MapViewWrapperProps) {
  return <MapViewDynamic places={places} />
}
