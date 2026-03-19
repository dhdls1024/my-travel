// 카테고리 탭 필터 컴포넌트 — 전체/교통/숙소/맛집/명소 탭으로 장소 필터링
// 클라이언트 컴포넌트 (탭 선택 상태를 부모로 전달하는 제어 컴포넌트)
"use client"

import type { PlaceCategory } from "@/types/travel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LIST, MARKER_COLORS } from "@/lib/constants"

interface CategoryTabsProps {
  // 현재 선택된 카테고리 (null이면 "전체")
  selected: PlaceCategory | null
  // 탭 변경 콜백 — 부모 컴포넌트에서 장소 목록 필터링 처리
  onSelect: (category: PlaceCategory | null) => void
  // 카테고리별 장소 수 (예: { 전체: 15, 교통: 3, 숙소: 2, 맛집: 5, 명소: 5 })
  counts: Record<string, number>
}

// CategoryTabs — 카테고리 탭 필터 컴포넌트
// shadcn Tabs를 기반으로 전체 + 각 카테고리 탭을 렌더링하며,
// 각 탭에는 카테고리 컬러 도트와 장소 수 배지를 표시한다
export default function CategoryTabs({
  selected,
  onSelect,
  counts,
}: CategoryTabsProps) {
  // Tabs value는 string이어야 하므로 null 선택 상태를 "전체"로 매핑
  const currentValue = selected ?? "전체"

  // 탭 변경 시 "전체"이면 null, 나머지는 PlaceCategory로 전달
  const handleValueChange = (value: string) => {
    if (value === "전체") {
      onSelect(null)
    } else {
      onSelect(value as PlaceCategory)
    }
  }

  return (
    // 모바일 가로 스크롤 대응 — overflow-x-auto + min-w-0 패턴
    <div className="w-full overflow-x-auto">
      <Tabs value={currentValue} onValueChange={handleValueChange}>
        <TabsList className="inline-flex h-auto gap-1 bg-transparent p-0">
          {/* 전체 탭 */}
          <TabsTrigger
            value="전체"
            aria-pressed={currentValue === "전체"}
            className="data-[state=active]:bg-accent flex items-center gap-1.5 rounded-md px-3 py-1.5"
          >
            {/* 전체 탭에는 컬러 도트 없음 */}
            <span className="text-sm">전체</span>
            {/* 전체 장소 수 배지 */}
            {counts["전체"] !== undefined && (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 rounded-full px-1.5 text-xs"
              >
                {counts["전체"]}
              </Badge>
            )}
          </TabsTrigger>

          {/* CATEGORY_LIST 순서대로 탭 렌더링 (교통, 숙소, 맛집, 명소) */}
          {CATEGORY_LIST.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              aria-pressed={currentValue === category}
              className="data-[state=active]:bg-accent flex items-center gap-1.5 rounded-md px-3 py-1.5"
            >
              {/* 카테고리 컬러 도트 — MARKER_COLORS 상수 기반 */}
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: MARKER_COLORS[category] }}
                aria-hidden="true"
              />
              <span className="text-sm">{category}</span>
              {/* 카테고리별 장소 수 배지 */}
              {counts[category] !== undefined && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 rounded-full px-1.5 text-xs"
                >
                  {counts[category]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
