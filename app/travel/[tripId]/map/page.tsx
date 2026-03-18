// 카카오 지도 페이지 — 서버 컴포넌트
// MapViewClient는 dynamic import(ssr:false)로 클라이언트에서만 렌더링
import type { Metadata } from "next"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { ROUTES, SITE_CONFIG } from "@/lib/constants"
import { getTripById, getPlacesByTripId } from "@/lib/dummy-data"

// MapViewClient: ssr:false — 카카오 SDK는 브라우저 전용 API이므로 서버 렌더링 불가
const MapViewClient = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    // 지도 로딩 중 플레이스홀더 — 지도 영역과 동일한 높이 유지하여 레이아웃 시프트 방지
    <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-gray-100">
      <p className="text-muted-foreground text-sm">지도를 불러오는 중...</p>
    </div>
  ),
})

// Next.js 15: params는 Promise로 래핑되어 전달됨 (await 필수)
type Params = Promise<{ tripId: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { tripId } = await params
  const trip = getTripById(tripId)
  return {
    title: trip
      ? `${trip.title} 지도 | ${SITE_CONFIG.name}`
      : `지도 보기 | ${SITE_CONFIG.name}`,
    description: trip
      ? `${trip.title}의 장소들을 지도에서 확인하세요.`
      : "",
  }
}

// ISR: 60초마다 재검증
export const revalidate = 60

export default async function TravelMapPage({ params }: { params: Params }) {
  const { tripId } = await params

  const trip = getTripById(tripId)
  // 존재하지 않는 여행 ID 접근 시 404 처리
  if (!trip) notFound()

  const places = getPlacesByTripId(tripId)
  // 위경도 좌표가 모두 있는 장소만 지도 마커로 표시
  const placesWithCoords = places.filter((p) => p.latitude && p.longitude)

  return (
    // overflow-hidden: 헤더(56px) + 지도가 100vh를 정확히 채우도록 스크롤 차단
    <div className="flex h-screen flex-col overflow-hidden">

      {/* 상단 헤더 바 — h-14(56px) 고정, 지도 높이 계산의 기준값 */}
      <header className="bg-background border-b flex h-14 shrink-0 items-center px-4">

        {/* 뒤로가기 버튼 — 여행 대시보드로 이동 */}
        <Link
          href={ROUTES.travel.dashboard(tripId)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          대시보드
        </Link>

        {/* 여행 제목 — mx-auto로 중앙 배치 */}
        <p className="text-muted-foreground mx-auto text-sm font-medium">
          {trip.title}
        </p>

        {/* 오른쪽 대칭용 빈 공간 — 제목이 시각적으로 정중앙에 오도록 좌측 Link와 너비 맞춤 */}
        <div className="w-16" aria-hidden="true" />
      </header>

      {/* 지도 영역 — flex-1로 헤더를 제외한 나머지 높이 전부 사용 */}
      <div className="flex-1 overflow-hidden">
        {/* MapViewClient 삽입 자리 — ssr:false dynamic import로 브라우저에서만 렌더링 */}
        <MapViewClient places={placesWithCoords} />
      </div>
    </div>
  )
}
