// 카테고리 탭 필터 컴포넌트 — 전체/교통/숙소/맛집/명소/카페 탭으로 장소 필터링
// shadcn Tabs 대신 div+button으로 직접 구현 — flex-wrap 모바일 줄바꿈을 위해
"use client"

import type { PlaceCategory } from "@/types/travel"
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

  // 선택 상태에 따른 탭 스타일 계산 — 선택 시 카테고리 컬러로 강조
  const getTabStyle = (value: string, color?: string) => {
    const isSelected = currentValue === value
    if (isSelected && color) {
      return cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        "shadow-sm"
      )
    }
    return cn(
      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
      isSelected
        ? "bg-foreground text-background shadow-sm"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    )
  }

  return (
    // 모바일: 전체(1행) + 카테고리 5개(2행) 고정 2행 레이아웃
    // sm 이상: 전체 + 카테고리 한 줄로 표시
    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
      {/* 1행: 전체 탭 단독 (모바일) / sm 이상에서는 카테고리와 같은 줄 */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(getTabStyle("전체"), "w-fit")}
        aria-pressed={currentValue === "전체"}
      >
        <span>전체</span>
        {counts["전체"] !== undefined && (
          <span className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
            currentValue === "전체"
              ? "bg-background/20 text-current"
              : "bg-muted text-muted-foreground"
          )}>
            {counts["전체"]}
          </span>
        )}
      </button>

      {/* 2행: 카테고리 5개 가로 배치 (모바일) / sm 이상에서는 전체와 같은 줄 */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_LIST.map((category) => {
          const isSelected = currentValue === category
          const color = MARKER_COLORS[category]

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category as PlaceCategory)}
              // 선택된 카테고리는 해당 컬러를 배경색으로 사용
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                isSelected
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              style={isSelected ? { backgroundColor: color } : undefined}
              aria-pressed={isSelected}
            >
              {/* 카테고리 컬러 도트 — 미선택 상태에서만 표시 */}
              {!isSelected && (
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              )}
              <span>{category}</span>
              {counts[category] !== undefined && (
                <span className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                  isSelected
                    ? "bg-white/25 text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  {counts[category]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
