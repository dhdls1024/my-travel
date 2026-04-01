// 여행 대시보드 클라이언트 컴포넌트
// 카테고리·날짜 필터 상태를 관리하고, 필터링된 장소 목록을 렌더링
// 서버 컴포넌트(page.tsx)에서 Trip, Place[] 를 props로 받아 사용
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Map, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ROUTES, CATEGORY_LIST } from "@/lib/constants"
import type { Trip, Place, PlaceCategory } from "@/types/travel"

import TripSummary from "@/components/travel/TripSummary"
import CategoryTabs from "@/components/travel/CategoryTabs"
import DateFilter from "@/components/travel/DateFilter"
import PlaceCard from "@/components/travel/PlaceCard"
import { RefreshButton } from "@/components/travel/RefreshButton"
import { AddPlaceDialog } from "@/components/travel/AddPlaceDialog"

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardClientProps {
  trip: Trip
  places: Place[]
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DashboardClient
 * - 카테고리 탭 + 날짜 드롭다운으로 places 를 필터링
 * - 데스크톱(lg+): 왼쪽 장소 목록 / 오른쪽 지도 placeholder 2열 레이아웃
 * - 모바일: 장소 목록 단일 열 + 하단 플로팅 "지도 보기" 버튼
 */
export default function DashboardClient({ trip, places }: DashboardClientProps) {
  // 선택된 카테고리 (null = 전체)
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null)
  // 선택된 날짜 (null = 전체 날짜)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // ── 카테고리별 카운트 계산 ──────────────────────────────────────────────────
  // checked=true 장소만 기준으로 카운트 — filteredPlaces에서 실제 렌더링되는 수와 일치시킴
  // (checked=false 장소를 포함하면 탭 숫자 > 실제 카드 수 불일치 발생)
  const categoryCounts = useMemo(() => {
    const checkedPlaces = places.filter((p) => p.checked)
    const counts: Record<string, number> = {
      전체: checkedPlaces.length,
    }
    for (const cat of CATEGORY_LIST) {
      counts[cat] = checkedPlaces.filter((p) => p.category === cat).length
    }
    return counts
  }, [places])

  // ── 방문 날짜 목록 추출 ────────────────────────────────────────────────────
  // visitDate 가 있는 장소의 날짜를 수집
  const availableDates = useMemo(() => {
    const dateSet = new Set<string>()
    for (const place of places) {
      if (!place.visitDate) continue
      if (place.visitDateEnd) {
        // 범위 날짜 전개: start부터 end까지 하루씩 추가
        const start = new Date(place.visitDate)
        const end = new Date(place.visitDateEnd)
        const cur = new Date(start)
        while (cur <= end) {
          dateSet.add(cur.toISOString().slice(0, 10))
          cur.setDate(cur.getDate() + 1)
        }
      } else {
        dateSet.add(place.visitDate)
      }
    }
    return Array.from(dateSet).sort()
  }, [places])

  // ── 필터링된 장소 목록 ─────────────────────────────────────────────────────
  // checked 필터 → 카테고리 필터 → 날짜 필터 순서로 적용
  const filteredPlaces = useMemo(() => {
    // 0. checked 필터 — checked === true 인 장소만 표시
    let result = places.filter((p) => p.checked)

    // 1. 카테고리 필터 (null 이면 전체 통과)
    if (selectedCategory !== null) {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // 2. 날짜 필터 (null 이면 전체 통과)
    if (selectedDate !== null) {
      result = result.filter((p) => {
        if (!p.visitDate) return false
        if (p.visitDateEnd) {
          return p.visitDate <= selectedDate && selectedDate <= p.visitDateEnd
        }
        return p.visitDate === selectedDate
      })
    }

    return result
  }, [places, selectedCategory, selectedDate])

  // ── 지도 링크 URL ──────────────────────────────────────────────────────────
  const mapUrl = ROUTES.travel.map(trip.id)

  // ── 비용 합계 계산 ─────────────────────────────────────────────────────────
  const totalCost = filteredPlaces.reduce((sum, p) => sum + (p.cost ?? 0), 0)
  const hasCost = filteredPlaces.some((p) => p.cost !== undefined)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* ── 상단: 여행 요약 + 액션 버튼 ───────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        {/* 여행 제목, 기간, 상태 요약 */}
        <TripSummary trip={trip} />

        {/* 우측 상단: 새로고침 + 장소 추가 버튼 */}
        <div className="flex shrink-0 items-center gap-2 pt-7">
          <RefreshButton tripId={trip.id} />
          <AddPlaceDialog tripId={trip.id} />
        </div>
      </div>

      {/* ── 필터 영역 — 배경 카드로 강조 ─────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-2">
          {/* 필터 아이콘 + 카테고리 탭 */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CategoryTabs
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              counts={categoryCounts}
            />
          </div>

          {/* 날짜 드롭다운 필터 */}
          {availableDates.length > 0 && (
            <div className="pl-5">
              <DateFilter
                dates={availableDates}
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── 비용 합계 + 결과 수 — 필터 기준으로 집계, cost 있는 장소가 1개 이상일 때만 표시 */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">
          {filteredPlaces.length}개 장소
        </span>
        {hasCost && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>예상 합계</span>
            <span className="font-semibold text-foreground">
              {totalCost.toLocaleString()}원
            </span>
          </div>
        )}
      </div>

      {/* ── 메인 콘텐츠: 2열 레이아웃 (데스크톱) / 단일 열 (모바일) ─────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 왼쪽 열: 장소 카드 목록 (전체 너비 / 데스크톱에서 2/3) */}
        {/* pb-20 lg:pb-0: 모바일에서 고정 플로팅 버튼 높이만큼 여백 확보 — 마지막 카드 가림 방지 */}
        <section className="lg:col-span-2 pb-20 lg:pb-0">
          {filteredPlaces.length > 0 ? (
            <ul className="space-y-2">
              {filteredPlaces.map((place) => (
                <li key={place.id}>
                  {/* tripId: 삭제 후 revalidatePath 처리에 필요한 여행 ID */}
                  <PlaceCard place={place} tripId={trip.id} />
                </li>
              ))}
            </ul>
          ) : (
            /* 빈 상태 메시지 — 필터 결과가 없을 때 */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
                🗺️
              </div>
              <p className="text-sm font-medium text-foreground">
                조건에 맞는 장소가 없습니다
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                필터를 변경하거나 전체 보기를 선택하세요
              </p>
            </div>
          )}
        </section>

        {/* 오른쪽 열: 지도 placeholder — 데스크톱에서만 표시 */}
        <aside className="hidden lg:col-span-1 lg:flex lg:flex-col">
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center",
              "rounded-2xl border border-border/60 bg-card",
              "min-h-[400px] gap-4",
            )}
          >
            {/* 지도 아이콘 */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-2xl">
              🗺️
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">지도에서 확인하기</p>
              <p className="mt-1 text-xs text-muted-foreground">장소의 위치를 지도에서 확인하세요</p>
            </div>

            {/* 지도 페이지로 이동 링크 */}
            <Link
              href={mapUrl}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5",
                "bg-primary text-primary-foreground text-sm font-medium",
                "transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
              )}
            >
              <Map className="h-4 w-4" />
              지도 보기
            </Link>
          </div>
        </aside>
      </div>

      {/* ── 모바일 플로팅 버튼: 지도 보기 ───────────────────────────────── */}
      {/* lg:hidden: 데스크톱에서는 숨기고 모바일에서만 표시 */}
      <div className="fixed bottom-6 right-5 lg:hidden">
        <Link
          href={mapUrl}
          aria-label="지도 보기"
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-3 shadow-xl",
            "bg-primary text-primary-foreground text-sm font-semibold",
            "transition-all active:scale-95 hover:shadow-2xl",
          )}
        >
          <Map className="h-4 w-4" />
          지도 보기
        </Link>
      </div>
    </div>
  )
}
