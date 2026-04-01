// 장소 카드 스켈레톤 — PlaceCard 레이아웃과 동일한 구조의 로딩 플레이스홀더
// Suspense fallback 또는 클라이언트 로딩 상태에서 사용
import { Skeleton } from "@/components/ui/skeleton"

// PlaceCardSkeleton — PlaceCard의 레이아웃을 그대로 미러링한 스켈레톤
export default function PlaceCardSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/60 bg-card"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="로딩 중"
    >
      {/* 왼쪽 카테고리 컬러 인디케이터 자리 */}
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="flex items-start justify-between gap-3 px-4 py-3.5 pl-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* 카테고리 배지 + 방문일 자리 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* 장소명 자리 */}
          <Skeleton className="h-5 w-2/3" />

          {/* 메모 자리 — 두 줄 */}
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>

        {/* 액션 버튼 자리 */}
        <div className="flex flex-col gap-1 shrink-0">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </div>
  )
}
