// 여행 카드 스켈레톤 — 여행 목록 로딩 시 표시되는 플레이스홀더
// TripCard 레이아웃과 동일한 구조로 시각적 일관성 유지
// Suspense fallback으로 사용
import { Skeleton } from "@/components/ui/skeleton"

// 커버 이미지 고정 높이 — TripCard와 동일한 값 사용
const COVER_HEIGHT_PX = 200

export default function TripCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="로딩 중"
    >
      {/* 커버 이미지 영역 스켈레톤 */}
      <Skeleton
        className="w-full rounded-none"
        style={{ height: COVER_HEIGHT_PX }}
      />

      {/* 카드 본문 스켈레톤 */}
      <div className="p-4 space-y-3">
        {/* 여행명 + 상태 배지 행 */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>

        {/* 날짜 + 박수 */}
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  )
}
