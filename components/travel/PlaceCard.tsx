// 장소 카드 컴포넌트 — 대시보드에서 각 Place를 카드 형태로 표시
// 카테고리 컬러 바, 배지, 장소명, 방문일, 메모, 외부 링크를 포함하는 서버 컴포넌트
import { ExternalLink } from "lucide-react"
// date-fns: 날짜 파싱 및 포맷팅 유틸리티
import { format, parseISO } from "date-fns"

import type { Place } from "@/types/travel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MARKER_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface PlaceCardProps {
  place: Place
}

// PlaceCard — 장소 카드 컴포넌트
// 왼쪽 카테고리 컬러 바로 카테고리를 시각적으로 구분하며,
// 방문일/메모/외부 링크는 값이 있을 때만 조건부 렌더링한다
export default function PlaceCard({ place }: PlaceCardProps) {
  // 카테고리에 해당하는 컬러 코드 — MARKER_COLORS 상수 기반
  const categoryColor = MARKER_COLORS[place.category]

  return (
    // hover 시 배경색 subtle 변경 — 클릭 가능한 느낌을 주기 위함
    <Card
      className={cn(
        "relative overflow-hidden py-0 transition-colors",
        "hover:bg-accent/50"
      )}
    >
      {/* 왼쪽 카테고리 컬러 바 — inline style로 동적 색상 적용 */}
      {/* Tailwind 동적 클래스는 purge 대상이 되므로 inline style 사용 */}
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: categoryColor }}
        aria-hidden="true"
      />

      <CardContent className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* 카테고리 배지 + 방문일 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 카테고리 배지 — MARKER_COLORS 배경색, 흰색 텍스트 */}
            <Badge
              style={{ backgroundColor: categoryColor }}
              className="shrink-0 border-0 text-white"
            >
              {place.category}
            </Badge>

            {/* 방문일 — visitDate가 있을 때만 표시 */}
            {/* visitDateEnd가 있으면 "M월 d일 ~ M월 d일" 범위 형식으로 표시 */}
            {place.visitDate && (
              <span className="text-muted-foreground text-xs">
                {place.visitDateEnd
                  ? `${format(parseISO(place.visitDate), "M월 d일")} ~ ${format(parseISO(place.visitDateEnd), "M월 d일")}`
                  : format(parseISO(place.visitDate), "M월 d일")}
              </span>
            )}
          </div>

          {/* 장소명 */}
          <p className="font-medium leading-snug">{place.name}</p>

          {/* 메모 — memo가 있을 때만 표시 */}
          {place.memo && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {place.memo}
            </p>
          )}

          {/* 예상비용 — cost가 있을 때만 표시, 천단위 콤마 포맷 */}
          {place.cost !== undefined && (
            <p className="text-muted-foreground text-xs">
              예상비용: {place.cost.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 외부 링크 버튼 — url이 있을 때만 표시 */}
        {place.url && (
          <a
            href={place.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-muted-foreground hover:text-foreground",
              "mt-0.5 shrink-0 transition-colors"
            )}
            aria-label={`${place.name} 외부 링크 열기`}
            onClick={() => {}}
            // TODO: 링크 클릭 추적 로직 구현 필요
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}
