// 카카오 지도 페이지 — 서버 컴포넌트
// MapViewWrapper: dynamic ssr:false를 클라이언트 컴포넌트에서 처리 (서버 컴포넌트에선 불가)
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { ROUTES, SITE_CONFIG } from "@/lib/constants"
import { getTrips, getPlaces, getBusStops } from "@/lib/notion"
import MapViewWrapper from "@/components/map/MapViewWrapper"

// Next.js 15: params는 Promise로 래핑되어 전달됨 (await 필수)
type Params = Promise<{ tripId: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { tripId } = await params
  // getTrips: Notion DB에서 전체 여행 목록을 조회한 뒤 tripId로 매칭
  const trips = await getTrips()
  const trip = trips.find((t) => t.id === tripId)
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

  // getTrips: Notion DB에서 전체 여행 목록을 조회한 뒤 tripId로 매칭
  const trips = await getTrips()
  const trip = trips.find((t) => t.id === tripId)
  // 존재하지 않는 여행 ID 접근 시 404 처리
  if (!trip) notFound()

  // getPlaces + getBusStops를 Promise.all로 병렬 호출 — 순차 호출 대비 응답 속도 개선
  const [places, busStops] = await Promise.all([
    getPlaces(tripId),
    getBusStops(tripId),
  ])
  // checked === true 이고 위경도 좌표가 모두 있는 장소만 지도 마커로 표시
  const placesWithCoords = places.filter((p) => p.checked && p.latitude && p.longitude)

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
        {/* MapViewWrapper — dynamic ssr:false가 내부 클라이언트 컴포넌트에서 처리됨 */}
        <MapViewWrapper places={placesWithCoords} busStops={busStops} />
      </div>
    </div>
  )
}
