// 여행 대시보드 페이지 — 서버 컴포넌트
// Notion API에서 Trip + Place[] 를 조회한 뒤 DashboardClient 에 props로 전달
import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SITE_CONFIG } from "@/lib/constants"
import { getTrips, getPlaces } from "@/lib/notion"
import DashboardClient from "@/components/travel/DashboardClient"
import PlaceCardSkeleton from "@/components/travel/PlaceCardSkeleton"

// Next.js 15: params 는 Promise 로 래핑되어 전달됨 (await 필수)
type Params = Promise<{ tripId: string }>

// 동적 메타데이터 — 여행 제목을 title 에 포함
export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { tripId } = await params

  // getTrips — Notion Trip DB 전체 조회 후 해당 tripId 탐색
  const trips = await getTrips()
  const trip = trips.find((t) => t.id === tripId)

  // Trip 이 없으면 기본 타이틀 반환 (notFound 는 page 에서 처리)
  const tripTitle = trip?.title ?? "여행 대시보드"

  return {
    title: `${tripTitle} | ${SITE_CONFIG.name}`,
    description: `${tripTitle}의 교통·숙소·맛집·명소 정보를 한눈에 확인하세요.`,
  }
}

// ISR: 60초마다 재검증
export const revalidate = 60

// 스켈레톤 목록 — Suspense fallback 으로 사용하는 로딩 UI
function PlaceListSkeleton() {
  return (
    <div className="space-y-3">
      {/* 스켈레톤 4개로 초기 로딩감 연출 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function TravelDashboardPage({
  params,
}: {
  params: Params
}) {
  const { tripId } = await params

  // getTrips — Notion Trip DB 전체 조회 후 해당 tripId 탐색, 없으면 404
  const trips = await getTrips()
  const trip = trips.find((t) => t.id === tripId)
  if (!trip) {
    notFound()
  }

  // getPlaces — tripId 기준으로 연결된 장소 목록 전체 조회 (커서 페이지네이션 내장)
  const places = await getPlaces(tripId)

  return (
    <main className="min-h-screen">
      {/*
       * Suspense로 감싸는 이유:
       * DashboardClient 내부에 서버 컴포넌트가 추가될 때를 대비하여
       * 스트리밍 로딩 UI를 미리 적용해둠
       */}
      <Suspense fallback={<PlaceListSkeleton />}>
        <DashboardClient trip={trip} places={places} />
      </Suspense>
    </main>
  )
}
