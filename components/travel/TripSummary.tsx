// 여행 대시보드 상단 요약 헤더 컴포넌트
// 여행 제목, 기간, D-Day, 박수, 상태 배지를 한눈에 표시하는 서버 컴포넌트
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import type { Trip, TripStatus } from "@/types/travel"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ROUTES } from "@/lib/constants"
import {
  calculateDday,
  formatDateRange,
  calculateNights,
} from "@/lib/date-utils"
import { cn } from "@/lib/utils"

// 여행 상태별 Badge variant 매핑
// "계획중" → outline, "확정" → default, "완료" → secondary
const STATUS_VARIANT_MAP: Record<
  TripStatus,
  "outline" | "default" | "secondary"
> = {
  계획중: "outline",
  확정: "default",
  완료: "secondary",
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
  const statusVariant = STATUS_VARIANT_MAP[trip.status]

  return (
    <div className="space-y-4">
      {/* 뒤로가기 링크 — 여행 목록 페이지로 이동 */}
      <Link
        href={ROUTES.travel.root}
        className={cn(
          "text-muted-foreground hover:text-foreground",
          "inline-flex items-center gap-1 text-sm transition-colors"
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        여행 목록
      </Link>

      {/* 제목 + 상태 배지 */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{trip.title}</h1>
        <Badge variant={statusVariant}>{trip.status}</Badge>
      </div>

      {/* 날짜 범위 + D-Day 배지 + 박수 */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <span>{dateRange}</span>
        <span aria-hidden="true">·</span>
        {/* D-Day 배지 — 출발 전/당일/여행중/완료 상태를 시각적으로 강조 */}
        <Badge variant="outline" className="font-mono">
          {dday}
        </Badge>
        <span aria-hidden="true">·</span>
        <span>{nights}</span>
      </div>

      {/* 하단 구분선 */}
      <Separator />
    </div>
  )
}
