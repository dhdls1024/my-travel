"use client"

// 장소 카드 컴포넌트 — 대시보드에서 각 Place를 카드 형태로 표시
// 카테고리 컬러 바, 배지, 장소명, 방문일, 메모, 외부 링크, 삭제 버튼을 포함하는 클라이언트 컴포넌트
// 삭제 버튼의 onClick 핸들러가 필요하여 "use client" 선언
import { useState } from "react"
// useRouter: 삭제 성공 후 페이지 데이터 갱신(router.refresh())에 사용
import { useRouter } from "next/navigation"
// toast: sonner 기반 토스트 알림 (삭제 성공/실패 피드백)
import { toast } from "sonner"
// ExternalLink: 외부 링크 아이콘
// Trash2: 삭제 버튼 기본 아이콘
// Loader2: 삭제 중 로딩 스피너 아이콘
import { ExternalLink, Trash2, Loader2, Pencil } from "lucide-react"
// date-fns: 날짜 파싱 및 포맷팅 유틸리티
import { format, parseISO } from "date-fns"

import type { Place } from "@/types/travel"
import { EditPlaceDialog } from "@/components/travel/EditPlaceDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MARKER_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

// DeleteButton props — 삭제 버튼 서브컴포넌트에 필요한 최소 정보만 전달
interface DeleteButtonProps {
  placeId: string
  placeName: string
  tripId: string
}

// EditButton props — 수정 버튼 서브컴포넌트에 필요한 최소 정보
interface EditButtonProps {
  place: Place
  tripId: string
}

// EditButton — 장소 수정 버튼 서브컴포넌트
// isEditOpen state와 EditPlaceDialog를 함께 관리 — PlaceCard 본체를 간결하게 유지
function EditButton({ place, tripId }: EditButtonProps) {
  // isEditOpen: 수정 다이얼로그 열림 상태
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsEditOpen(true)}
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label={`${place.name} 수정`}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      {/* EditPlaceDialog — isEditOpen state로 열림/닫힘 제어 */}
      <EditPlaceDialog
        place={place}
        tripId={tripId}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}

// DeleteButton — 장소 삭제 버튼 서브컴포넌트
// 30줄 규칙에 따라 PlaceCard에서 분리; 삭제 상태(isDeleting)를 독립적으로 관리
function DeleteButton({ placeId, placeName, tripId }: DeleteButtonProps) {
  // isDeleting: DELETE API 호출 중 여부 — true일 때 버튼 비활성화 + 스피너 표시
  const [isDeleting, setIsDeleting] = useState(false)
  // router: 삭제 성공 후 서버 컴포넌트 데이터를 다시 가져오기 위한 refresh 용도
  const router = useRouter()

  // handleDelete — DELETE /api/places/[placeId]?tripId=... 호출 핸들러
  // tripId를 쿼리 파라미터로 전달해 서버에서 revalidatePath 처리
  const handleDelete = async () => {
    // 실수 삭제 방지 — 브라우저 기본 confirm 다이얼로그로 1회 확인
    if (!window.confirm(`"${placeName}"을(를) 삭제하시겠습니까?`)) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/places/${placeId}?tripId=${tripId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("삭제 응답 오류")
      // 삭제 성공: 서버 컴포넌트 캐시 무효화 후 토스트 알림
      router.refresh()
      toast.success("삭제되었습니다")
    } catch {
      // 삭제 실패: 에러 토스트 알림
      toast.error("삭제에 실패했습니다")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={cn(
        "text-muted-foreground hover:text-destructive transition-colors",
        // 로딩 중에는 포인터 이벤트 제거 — 중복 요청 방지
        isDeleting && "pointer-events-none opacity-50"
      )}
      aria-label={`${placeName} 삭제`}
    >
      {/* 삭제 중이면 스피너, 아니면 휴지통 아이콘 */}
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}

interface PlaceCardProps {
  place: Place
  // tripId: 삭제 후 서버에서 revalidatePath 처리에 필요한 여행 ID
  tripId: string
}

// PlaceCard — 장소 카드 컴포넌트
// 왼쪽 카테고리 컬러 바로 카테고리를 시각적으로 구분하며,
// 방문일/메모/외부 링크는 값이 있을 때만 조건부 렌더링한다
export default function PlaceCard({ place, tripId }: PlaceCardProps) {
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

        {/* 우측 액션 컬럼 — 외부 링크(위)와 삭제 버튼(아래)를 세로 배치 */}
        {/* url이 없어도 삭제 버튼은 항상 표시되므로 컬럼 자체는 항상 렌더링 */}
        <div className="flex flex-col items-center justify-between self-stretch shrink-0">
          {/* 외부 링크 버튼 — url 유무에 관계없이 동일 공간 차지 (삭제버튼 위치 고정) */}
          <div className="h-4 w-4">
            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors"
                )}
                aria-label={`${place.name} 외부 링크 열기`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>

          {/* 수정 버튼 — EditButton 서브컴포넌트 (EditPlaceDialog 포함) */}
          <EditButton place={place} tripId={tripId} />

          {/* 삭제 버튼 — DeleteButton 서브컴포넌트로 분리 (30줄 규칙) */}
          <DeleteButton
            placeId={place.id}
            placeName={place.name}
            tripId={tripId}
          />
        </div>
      </CardContent>
    </Card>
  )
}
