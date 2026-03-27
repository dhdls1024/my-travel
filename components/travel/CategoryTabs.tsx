// 카테고리 탭 필터 컴포넌트 — 전체/교통/숙소/맛집/명소/카페 탭으로 장소 필터링
// shadcn Tabs 대신 div+button으로 직접 구현 — flex-wrap 모바일 줄바꿈을 위해
"use client"

import type { PlaceCategory } from "@/types/travel"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LIST, MARKER_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface CategoryTabsProps {
  // 현재 선택된 카테고리 (null이면 "전체")
  selected: PlaceCategory | null
  // 탭 변경 콜백 — 부모 컴포넌트에서 장소 목록 필터링 처리
  onSelect: (category: PlaceCategory | null) => void
  // 카테고리별 장소 수 (예: { 전체: 15, 교통: 3, 숙소: 2, 맛집: 5, 명소: 5 })
  counts: Record<string, number>
}

// CategoryTabs — 카테고리 탭 필터 컴포넌트
// 모바일에서 flex-wrap으로 2행 자동 줄바꿈, sm 이상에서는 한 줄 유지
export default function CategoryTabs({
  selected,
  onSelect,
  counts,
}: CategoryTabsProps) {
  const currentValue = selected ?? "전체"

  // 탭 버튼 공통 스타일
  const tabClass = (value: string) =>
    cn(
      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
      "border border-transparent",
      currentValue === value
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
    )

  return (
    // 모바일: 전체(1행) + 카테고리 5개(2행) 고정 2행 레이아웃
    // sm 이상: 전체 + 카테고리 한 줄로 표시
    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center">
      {/* 1행: 전체 탭 단독 (모바일) / sm 이상에서는 카테고리와 같은 줄 */}
      {/* w-fit: flex-col에서 버튼이 가로로 늘어나지 않도록 내용 크기에 맞게 제한 */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(tabClass("전체"), "w-fit")}
        aria-pressed={currentValue === "전체"}
      >
        <span>전체</span>
        {counts["전체"] !== undefined && (
          <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
            {counts["전체"]}
          </Badge>
        )}
      </button>

      {/* 2행: 카테고리 5개 가로 배치 (모바일) / sm 이상에서는 전체와 같은 줄 */}
      <div className="flex flex-wrap gap-1">
        {CATEGORY_LIST.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category as PlaceCategory)}
            className={tabClass(category)}
            aria-pressed={currentValue === category}
          >
            {/* 카테고리 컬러 도트 — MARKER_COLORS 상수 기반 */}
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: MARKER_COLORS[category] }}
              aria-hidden="true"
            />
            <span>{category}</span>
            {counts[category] !== undefined && (
              <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
                {counts[category]}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
