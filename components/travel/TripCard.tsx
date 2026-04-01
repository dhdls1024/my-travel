// 여행 카드 컴포넌트 — 여행 목록 페이지에서 각 Trip을 카드 형태로 표시
// 커버 이미지, 제목, 날짜 범위, D-Day 배지, 상태 배지, 장소 수를 포함
// 서버 컴포넌트 (클라이언트 상태/이벤트 없음)
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Clock } from "lucide-react"

import type { Trip, TripStatus } from "@/types/travel"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

// date-utils에서 날짜 관련 유틸 함수 import
import {
  calculateDday,
  formatDateRange,
  calculateNights,
} from "@/lib/date-utils"

interface TripCardProps {
  trip: Trip
  placesCount: number // 해당 여행에 등록된 장소 수
}

// 여행 상태별 스타일 매핑 — 배경+텍스트 색상 조합
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

// 커버 이미지가 없을 때 카테고리별 그라디언트 — 여행 분위기 색상
const COVER_GRADIENTS = [
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-amber-400 via-orange-400 to-rose-500",
  "from-teal-400 via-cyan-500 to-blue-600",
  "from-violet-400 via-purple-500 to-indigo-600",
]

// 커버 이미지 고정 높이 (px) — 매직넘버 방지
const COVER_HEIGHT_PX = 200

export default function TripCard({ trip, placesCount }: TripCardProps) {
  const { id, title, startDate, endDate, status, coverImage } = trip

  // 날짜 관련 표시 문자열 계산
  const dateRange = formatDateRange(startDate, endDate)
  const dday = calculateDday(startDate, endDate)
  const nights = calculateNights(startDate, endDate)
  const statusStyle = STATUS_STYLE[status]

  // 커버 없을 때 사용할 그라디언트 — title 길이 기반으로 고정 선택 (순환 방지)
  const gradientIdx = title.length % COVER_GRADIENTS.length
  const gradientClass = COVER_GRADIENTS[gradientIdx]

  return (
    // Link로 카드 전체 감싸기 — 여행 대시보드 페이지로 이동
    <Link
      href={ROUTES.travel.dashboard(id)}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      aria-label={`${title} 여행 대시보드로 이동`}
    >
      {/* 카드 컨테이너 — hover 시 살짝 위로 이동 + 그림자 강조 */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-border">

        {/* 커버 이미지 영역 */}
        <div
          className={cn(
            "relative w-full overflow-hidden",
            !coverImage && `bg-gradient-to-br ${gradientClass}`
          )}
          style={{ height: COVER_HEIGHT_PX }}
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`${title} 커버 이미지`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            // 커버 이미지 없을 때 그라디언트 + 아이콘
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-14 w-14 text-white/40" aria-hidden="true" />
            </div>
          )}

          {/* 이미지 위 그라디언트 오버레이 — 텍스트 가독성 확보 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* D-Day 배지 — 이미지 우상단에 오버레이 */}
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-lg bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {dday}
            </span>
          </div>

          {/* 장소 수 배지 — 이미지 좌하단 */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/50 px-2.5 py-1 text-xs text-white/90 backdrop-blur-sm">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {placesCount}개 장소
            </span>
          </div>
        </div>

        {/* 카드 본문 */}
        <div className="p-4 space-y-3">
          {/* 여행명 + 상태 배지 */}
          <div className="flex items-start justify-between gap-2">
            {/* h3: 페이지 h1 → 섹션 h2 아래 카드 타이틀이므로 h3가 의미론적으로 올바름 */}
            <h3
              className="line-clamp-1 text-lg font-semibold leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
            >
              {title}
            </h3>

            {/* 상태 배지 — 도트 + 텍스트 조합 */}
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                statusStyle.bg,
                statusStyle.text
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
              {status}
            </span>
          </div>

          {/* 날짜 정보 */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {dateRange}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {nights}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
