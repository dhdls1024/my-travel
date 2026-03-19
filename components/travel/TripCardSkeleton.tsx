// 여행 카드 스켈레톤 — 여행 목록 로딩 시 표시되는 플레이스홀더
// TripCard 레이아웃과 동일한 구조로 시각적 일관성 유지
// Suspense fallback으로 사용
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// 커버 이미지 고정 높이 — TripCard와 동일한 값 사용
const COVER_HEIGHT_PX = 192

export default function TripCardSkeleton() {
  return (
    <Card className="overflow-hidden" role="status" aria-live="polite" aria-busy="true" aria-label="로딩 중">
      {/* 커버 이미지 영역 스켈레톤 */}
      <Skeleton
        className="w-full rounded-none"
        style={{ height: COVER_HEIGHT_PX }}
      />

      {/* 카드 본문 스켈레톤 — CardContent 패딩과 동일 */}
      <CardContent className="p-4">
        {/* 여행명 + 상태 배지 행 */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
        </div>

        {/* 날짜 범위 + 박수 */}
        <Skeleton className="mb-3 h-4 w-2/5" />

        {/* 장소 수 */}
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
  )
}
