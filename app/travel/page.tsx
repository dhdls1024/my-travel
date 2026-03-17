// 여행 목록 페이지 — 서버 컴포넌트 (기본)
// Notion DB에서 Trip 목록을 조회해 카드 형태로 나열
import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
  title: `여행 목록 | ${SITE_CONFIG.name}`,
  description: "나의 여행 계획 목록을 한눈에 확인하세요.",
}

// ISR: 60초마다 재검증 (Notion 데이터 갱신 주기와 동일)
export const revalidate = 60

export default async function TravelListPage() {
  // TODO: getTrips() 호출로 Notion Trip 목록 조회
  // const trips = await getTrips()

  return (
    <main className="flex min-h-screen flex-col">
      {/* TODO: TravelListSection 컴포넌트 구현 */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">여행 목록</h1>
        {/* TODO: Trip 카드 그리드 렌더링 */}
      </section>
    </main>
  )
}
