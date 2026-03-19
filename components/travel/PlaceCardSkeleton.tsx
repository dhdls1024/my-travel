// 장소 카드 스켈레톤 — PlaceCard 레이아웃과 동일한 구조의 로딩 플레이스홀더
// Suspense fallback 또는 클라이언트 로딩 상태에서 사용
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// PlaceCardSkeleton — PlaceCard의 레이아웃을 그대로 미러링한 스켈레톤
// 왼쪽 컬러 바 자리, 카테고리 배지, 장소명, 메모 영역을 Skeleton으로 대체한다
export default function PlaceCardSkeleton() {
  return (
    <Card className="relative overflow-hidden py-0" role="status" aria-live="polite" aria-busy="true" aria-label="로딩 중">
      {/* 왼쪽 카테고리 컬러 바 자리 — PlaceCard와 동일한 위치/크기 */}
      <div className="absolute inset-y-0 left-0 w-1">
        <Skeleton className="h-full w-full" />
      </div>

      <CardContent className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* 카테고리 배지 + 방문일 자리 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* 장소명 자리 */}
          <Skeleton className="h-5 w-2/3" />

          {/* 메모 자리 — 두 줄 */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* 외부 링크 버튼 자리 */}
        <Skeleton className="mt-0.5 h-4 w-4 shrink-0" />
      </CardContent>
    </Card>
  )
}
