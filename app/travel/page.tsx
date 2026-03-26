// 여행 목록 페이지 — 서버 컴포넌트
// Notion Trip DB에서 여행 목록을 조회하여 카드 그리드로 렌더링
import { Suspense } from "react"
import type { Metadata } from "next"

import { SITE_CONFIG } from "@/lib/constants"
import { getTrips, getPlacesCount } from "@/lib/notion"
import TripCard from "@/components/travel/TripCard"
import TripCardSkeleton from "@/components/travel/TripCardSkeleton"

export const metadata: Metadata = {
  title: `여행 목록 | ${SITE_CONFIG.name}`,
  description: "나의 여행 계획 목록을 한눈에 확인하세요.",
}

// ISR: 60초마다 재검증 (Notion 데이터 갱신 주기와 동일)
export const revalidate = 60

// 로딩 중 표시할 스켈레톤 카드 수 — 매직넘버 방지
const SKELETON_COUNT = 3

// 스켈레톤 fallback 컴포넌트 — Suspense 경계 내부에서 사용
function TripListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        // 스켈레톤은 key로 index 사용 (정적 목록이므로 안전)
        <TripCardSkeleton key={index} />
      ))}
    </div>
  )
}

// 실제 여행 목록 컴포넌트 — 비동기 데이터 로딩 분리를 위한 별도 컴포넌트
// Suspense로 감싸서 스트리밍 SSR 활용 (초기 HTML에 스켈레톤 포함)
async function TripList() {
  // Notion Trip DB에서 전체 여행 목록 조회 (출발일 내림차순)
  const trips = await getTrips()

  // 여행이 없을 때 빈 상태 메시지 표시
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          아직 등록된 여행이 없어요.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Notion에서 여행 계획을 추가하면 여기에 표시됩니다.
        </p>
      </div>
    )
  }

  // 모든 여행의 장소 수를 병렬로 조회 — 순차 호출보다 빠르게 처리
  const placesCounts = await Promise.all(
    trips.map((trip) => getPlacesCount(trip.id))
  )

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip, index) => (
        <TripCard
          key={trip.id}
          trip={trip}
          placesCount={placesCounts[index]}
        />
      ))}
    </div>
  )
}

export default async function TravelListPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">여행 목록</h1>
          <p className="mt-2 text-muted-foreground">
            나의 여행 계획을 한눈에 확인하고 관리하세요.
          </p>
        </div>

        {/* 카드 그리드 — Suspense로 스켈레톤 fallback 처리 */}
        <Suspense fallback={<TripListSkeleton />}>
          <TripList />
        </Suspense>
      </section>
    </main>
  )
}
