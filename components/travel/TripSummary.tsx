// 여행 대시보드 상단 요약 헤더 컴포넌트
// 여행 제목, 기간, D-Day, 박수, 상태 배지를 한눈에 표시하는 서버 컴포넌트
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import type { Trip, TripStatus } from "@/types/travel"
import { ROUTES } from "@/lib/constants"
import {
  calculateDday,
  formatDateRange,
  calculateNights,
} from "@/lib/date-utils"
import { cn } from "@/lib/utils"

// 여행 상태별 스타일 매핑
const STATUS_STYLE: Record<TripStatus, { bg: string; text: string; dot: string }> = {
  계획중: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-400",
  },
  확정: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
  완료: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

interface TripSummaryProps {
  trip: Trip
}

// TripSummary — 여행 요약 헤더 컴포넌트
// 뒤로가기 링크, 제목, 날짜 범위, D-Day 배지, 박수, 상태 배지를 렌더링한다
export default function TripSummary({ trip }: TripSummaryProps) {
  const dday = calculateDday(trip.startDate, trip.endDate)
  const dateRange = formatDateRange(trip.startDate, trip.endDate)
  const nights = calculateNights(trip.startDate, trip.endDate)
  const statusStyle = STATUS_STYLE[trip.status]

  return (
    <div className="space-y-3 min-w-0">
      {/* 뒤로가기 링크 — 여행 목록 페이지로 이동 */}
      <Link
        href={ROUTES.travel.root}
        className={cn(
          "text-muted-foreground hover:text-foreground",
          "inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        여행 목록
      </Link>

      {/* 제목 + 상태 배지 */}
      <div className="flex flex-wrap items-center gap-3">
        <h1
          className="text-2xl font-bold leading-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
        >
          {trip.title}
        </h1>
        {/* 상태 배지 — 도트 + 텍스트 조합 */}
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyle.bg,
            statusStyle.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
          {trip.status}
        </span>
      </div>

      {/* 날짜 범위 + D-Day 배지 + 박수 */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{dateRange}</span>
        <span className="text-muted-foreground/40" aria-hidden="true">·</span>
        {/* D-Day 배지 — 출발 전/당일/여행중/완료 상태를 시각적으로 강조 */}
        <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 font-mono text-xs font-medium text-foreground">
          {dday}
        </span>
        <span className="text-muted-foreground/40" aria-hidden="true">·</span>
        <span>{nights}</span>
      </div>
    </div>
  )
}
