// 여행 대시보드 페이지 — 서버 컴포넌트 (기본)
// 특정 Trip의 장소 목록을 카테고리별로 필터링해 표시
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
    title: `여행 대시보드 | ${SITE_CONFIG.name}`,
    description: `여행 ID ${tripId}의 교통·숙소·맛집·명소 정보를 확인하세요.`,
  }
}

// ISR: 60초마다 재검증
export const revalidate = 60

export default async function TravelDashboardPage({ params }: { params: Params }) {
  const { tripId } = await params

  // TODO: getTrip(tripId), getPlaces(tripId) 호출로 데이터 조회
  // const trip = await getTrip(tripId)
  // const places = await getPlaces(tripId)

  return (
    <main className="flex min-h-screen flex-col">
      {/* TODO: TripHeader 컴포넌트 — 여행 제목, 날짜, D-Day 표시 */}
      {/* TODO: CategoryFilter 컴포넌트 — 교통/숙소/맛집/명소 탭 */}
      {/* TODO: PlaceList 컴포넌트 — 필터링된 장소 카드 목록 */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">여행 대시보드</h1>
        <p className="text-muted-foreground mt-1 text-sm">tripId: {tripId}</p>
      </section>
    </main>
  )
}
