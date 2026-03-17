// 카카오 지도 페이지 — 서버 컴포넌트 (기본)
// 카카오 지도 컴포넌트 자체는 "use client" (브라우저 API 필수)
// 이 페이지는 서버에서 장소 데이터를 조회 후 클라이언트 지도 컴포넌트에 props로 전달
import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/constants"

// Next.js 15: params는 Promise로 래핑되어 전달됨 (await 필수)
type Params = Promise<{ tripId: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { tripId } = await params
  // TODO: getTrip(tripId)로 실제 여행 제목 조회
  return {
    title: `지도 보기 | ${SITE_CONFIG.name}`,
    description: `여행 ID ${tripId}의 장소들을 지도에서 확인하세요.`,
  }
}

// ISR: 60초마다 재검증
export const revalidate = 60

export default async function TravelMapPage({ params }: { params: Params }) {
  const { tripId } = await params

  // TODO: getPlaces(tripId)로 좌표가 있는 장소 목록 조회
  // const places = await getPlaces(tripId)
  // const placesWithCoords = places.filter(p => p.latitude && p.longitude)

  return (
    <main className="flex min-h-screen flex-col">
      {/* TODO: KakaoMap 클라이언트 컴포넌트 — 마커 + CustomOverlay */}
      {/* 주의: 지도 컨테이너에 반드시 고정 높이 지정 (height: 0이면 렌더링 안 됨) */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">지도 보기</h1>
        <p className="text-muted-foreground mt-1 text-sm">tripId: {tripId}</p>
        {/* TODO: KakaoMapClient 컴포넌트 삽입 */}
      </section>
    </main>
  )
}
