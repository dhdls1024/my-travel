// 여행 카드 컴포넌트 — 여행 목록 페이지에서 각 Trip을 카드 형태로 표시
// 커버 이미지, 제목, 날짜 범위, D-Day 배지, 상태 배지, 장소 수를 포함
// 서버 컴포넌트 (클라이언트 상태/이벤트 없음)
import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"

import type { Trip, TripStatus } from "@/types/travel"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// date-utils에서 날짜 관련 유틸 함수 import (다른 에이전트가 구현 중)
import {
  calculateDday,
  formatDateRange,
  calculateNights,
} from "@/lib/date-utils"

interface TripCardProps {
  trip: Trip
  placesCount: number // 해당 여행에 등록된 장소 수
}

// 여행 상태별 Badge variant 매핑
// - 계획중: outline (미확정 상태임을 시각적으로 구분)
// - 확정: default (강조)
// - 완료: secondary (비활성 느낌)
const STATUS_VARIANT: Record<TripStatus, "outline" | "default" | "secondary"> =
  {
    계획중: "outline",
    확정: "default",
    완료: "secondary",
  }

// 커버 이미지가 없을 때 표시할 그라디언트 플레이스홀더 클래스
const COVER_PLACEHOLDER_CLASS =
  "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"

// 커버 이미지 고정 높이 (px) — 매직넘버 방지
const COVER_HEIGHT_PX = 192

export default function TripCard({ trip, placesCount }: TripCardProps) {
  const { id, title, startDate, endDate, status, coverImage } = trip

  // 날짜 관련 표시 문자열 계산
  const dateRange = formatDateRange(startDate, endDate)
  // calculateDday는 여행중 상태 판별을 위해 endDate도 함께 전달
  const dday = calculateDday(startDate, endDate)
  const nights = calculateNights(startDate, endDate)

  return (
    // Link로 카드 전체 감싸기 — 여행 대시보드 페이지로 이동
    <Link
      href={ROUTES.travel.dashboard(id)}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      aria-label={`${title} 여행 대시보드로 이동`}
    >
      {/* hover 시 카드 살짝 올라가는 효과 */}
      <Card className="overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
        {/* 커버 이미지 영역 */}
        <div
          className={cn(
            "relative w-full overflow-hidden",
            !coverImage && COVER_PLACEHOLDER_CLASS
          )}
          style={{ height: COVER_HEIGHT_PX }}
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`${title} 커버 이미지`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            // 커버 이미지 없을 때 그라디언트 + 아이콘 표시
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-12 w-12 text-white/70" aria-hidden="true" />
            </div>
          )}

          {/* D-Day 배지 — 이미지 우상단에 오버레이 */}
          <div className="absolute right-3 top-3">
            <Badge
              variant="default"
              className="bg-black/60 text-white backdrop-blur-sm hover:bg-black/60"
            >
              {dday}
            </Badge>
          </div>
        </div>

        {/* 카드 본문 */}
        <CardContent className="p-4">
          {/* 상태 배지 + 여행명 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-lg font-semibold leading-tight">
              {title}
            </h2>
            {/* 여행 상태 배지 (계획중 / 확정 / 완료) */}
            <Badge
              variant={STATUS_VARIANT[status]}
              className="shrink-0 text-xs"
            >
              {status}
            </Badge>
          </div>

          {/* 날짜 범위 + 박수 */}
          <p className="mb-3 text-sm text-muted-foreground">
            {dateRange}
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            {nights}
          </p>

          {/* 장소 수 */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{placesCount}개 장소</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
