// 여행 대시보드 클라이언트 컴포넌트
// 카테고리·날짜 필터 상태를 관리하고, 필터링된 장소 목록을 렌더링
// 서버 컴포넌트(page.tsx)에서 Trip, Place[] 를 props로 받아 사용
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Map, RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"
import { ROUTES, CATEGORY_LIST } from "@/lib/constants"
import type { Trip, Place, PlaceCategory } from "@/types/travel"

import TripSummary from "@/components/travel/TripSummary"
import CategoryTabs from "@/components/travel/CategoryTabs"
import DateFilter from "@/components/travel/DateFilter"
import PlaceCard from "@/components/travel/PlaceCard"

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
  // CATEGORY_LIST 순서를 보장하기 위해 배열 기반으로 계산
  // useMemo: places 가 바뀔 때만 재계산
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      전체: places.length,
    }
    for (const cat of CATEGORY_LIST) {
      counts[cat] = places.filter((p) => p.category === cat).length
    }
    return counts
  }, [places])

  // ── 방문 날짜 목록 추출 ────────────────────────────────────────────────────
  // visitDate 가 있는 장소의 날짜를 수집
  // 범위 날짜(visitDateEnd 존재)인 경우 start~end 사이의 모든 날짜를 전개하여 추가
  // 중복 제거 → 오름차순 정렬
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
  // 카테고리 필터 → 날짜 필터 순서로 적용
  const filteredPlaces = useMemo(() => {
    let result = places

    // 1. 카테고리 필터 (null 이면 전체 통과)
    if (selectedCategory !== null) {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // 2. 날짜 필터 (null 이면 전체 통과)
    // 범위 날짜(visitDateEnd 존재)인 경우 start~end 사이에 선택 날짜가 포함되면 매칭
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* ── 상단: 여행 요약 + 새로고침 버튼 ────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        {/* 여행 제목, 기간, 상태 요약 */}
        <TripSummary trip={trip} />

        {/*
         * 새로고침 버튼 — 현재는 UI만 구현
         * Phase 3에서 ISR on-demand revalidation 연결 예정
         */}
        <button
          type="button"
          aria-label="데이터 새로고침"
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5",
            "text-sm text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground",
          )}
        >
          {/* lucide-react RefreshCw 아이콘 */}
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {/* ── 필터 영역: 카테고리 탭 + 날짜 필터 가로 배치 ───────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* 카테고리 탭 — counts prop 은 향후 CategoryTabs 업데이트 시 전달 */}
        <CategoryTabs
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          counts={categoryCounts}
        />

        {/* 날짜 드롭다운 필터 */}
        {availableDates.length > 0 && (
          <DateFilter
            dates={availableDates}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        )}
      </div>

      {/* ── 메인 콘텐츠: 2열 레이아웃 (데스크톱) / 단일 열 (모바일) ─────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 왼쪽 열: 장소 카드 목록 (전체 너비 / 데스크톱에서 2/3) */}
        <section className="lg:col-span-2">
          {filteredPlaces.length > 0 ? (
            <ul className="space-y-3">
              {filteredPlaces.map((place) => (
                <li key={place.id}>
                  <PlaceCard place={place} />
                </li>
              ))}
            </ul>
          ) : (
            /* 빈 상태 메시지 — 필터 결과가 없을 때 */
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Map className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                조건에 맞는 장소가 없습니다
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                필터를 변경하거나 전체 보기를 선택하세요
              </p>
            </div>
          )}
        </section>

        {/* 오른쪽 열: 지도 placeholder — 데스크톱에서만 표시 */}
        {/*
         * lg:flex: 모바일에서는 숨기고 데스크톱에서만 표시
         * 지도 컴포넌트는 Phase 2(app/travel/[tripId]/map/page.tsx)에서 구현 예정
         */}
        <aside className="hidden lg:col-span-1 lg:flex lg:flex-col">
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center",
              "rounded-lg bg-muted/40 border",
              "min-h-[400px] gap-4",
            )}
          >
            {/* 지도 아이콘 */}
            <Map className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">지도에서 장소를 확인하세요</p>

            {/* 지도 페이지로 이동 링크 */}
            <Link
              href={mapUrl}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2",
                "bg-primary text-primary-foreground text-sm font-medium",
                "transition-opacity hover:opacity-90",
              )}
            >
              <Map className="h-4 w-4" />
              지도 보기
            </Link>
          </div>
        </aside>
      </div>

      {/* ── 모바일 플로팅 버튼: 지도 보기 ───────────────────────────────── */}
      {/*
       * lg:hidden: 데스크톱에서는 숨기고 모바일에서만 표시
       * fixed + bottom 으로 화면 하단에 고정
       */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Link
          href={mapUrl}
          aria-label="지도 보기"
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-3 shadow-lg",
            "bg-primary text-primary-foreground text-sm font-medium",
            "transition-transform active:scale-95",
          )}
        >
          <Map className="h-4 w-4" />
          지도 보기
        </Link>
      </div>
    </div>
  )
}
