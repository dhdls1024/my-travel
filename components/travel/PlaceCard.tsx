"use client"

// 장소 카드 컴포넌트 — 대시보드에서 각 Place를 카드 형태로 표시
// 카테고리 컬러 인디케이터, 배지, 장소명, 방문일, 메모, 외부 링크, 삭제 버튼을 포함하는 클라이언트 컴포넌트
// 삭제 버튼의 onClick 핸들러가 필요하여 "use client" 선언
import { useState } from "react"
// useRouter: 삭제 성공 후 페이지 데이터 갱신(router.refresh())에 사용
import { useRouter } from "next/navigation"
// toast: sonner 기반 토스트 알림 (삭제 성공/실패 피드백)
import { toast } from "sonner"
import { ExternalLink, Trash2, Loader2, Pencil, CalendarDays, Banknote } from "lucide-react"
// date-fns: 날짜 파싱 및 포맷팅 유틸리티
import { format, parseISO } from "date-fns"

import type { Place } from "@/types/travel"
import { EditPlaceDialog } from "@/components/travel/EditPlaceDialog"
// AlertDialog: shadcn 기반 확인 다이얼로그 — window.confirm 대체 (PWA 호환, 접근성 개선)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
// isEditOpen state와 EditPlaceDialog를 함께 관리
function EditButton({ place, tripId }: EditButtonProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsEditOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        aria-label={`${place.name} 수정`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
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
// AlertDialog로 삭제 확인 — window.confirm 대체 (PWA 모드 호환, 모바일 UX 개선)
function DeleteButton({ placeId, placeName, tripId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // handleDelete — AlertDialog Action 버튼이 직접 호출 (confirm 분기 없음)
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/places/${placeId}?tripId=${tripId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("삭제 응답 오류")
      router.refresh()
      toast.success("삭제되었습니다")
    } catch {
      toast.error("삭제에 실패했습니다")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={isDeleting}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30",
            isDeleting && "pointer-events-none opacity-50"
          )}
          aria-label={`${placeName} 삭제`}
        >
          {/* 삭제 중이면 스피너, 아니면 휴지통 아이콘 */}
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>장소 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>&quot;{placeName}&quot;</strong>을(를) 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface PlaceCardProps {
  place: Place
  // tripId: 삭제 후 서버에서 revalidatePath 처리에 필요한 여행 ID
  tripId: string
}

// PlaceCard — 장소 카드 컴포넌트
// 왼쪽 카테고리 컬러 인디케이터로 카테고리를 시각적으로 구분하며,
// 방문일/메모/외부 링크는 값이 있을 때만 조건부 렌더링한다
export default function PlaceCard({ place, tripId }: PlaceCardProps) {
  // 카테고리에 해당하는 컬러 코드 — MARKER_COLORS 상수 기반
  const categoryColor = MARKER_COLORS[place.category]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-200",
        "hover:border-border hover:shadow-md"
      )}
    >
      {/* 왼쪽 카테고리 컬러 인디케이터 — inline style로 동적 색상 적용 */}
      {/* Tailwind 동적 클래스는 purge 대상이 되므로 inline style 사용 */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: categoryColor }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3 px-4 py-3.5 pl-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* 카테고리 배지 + 방문일 — 한 행으로 배치 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 카테고리 배지 — 컬러 배경에 흰색 텍스트 */}
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {place.category}
            </span>

            {/* 방문일 — visitDate가 있을 때만 표시 */}
            {place.visitDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {place.visitDateEnd
                  ? `${format(parseISO(place.visitDate), "M월 d일")} ~ ${format(parseISO(place.visitDateEnd), "M월 d일")}`
                  : format(parseISO(place.visitDate), "M월 d일")}
              </span>
            )}
          </div>

          {/* 장소명 */}
          <p className="text-sm font-semibold leading-snug text-foreground">
            {place.name}
          </p>

          {/* 메모 — memo가 있을 때만 표시 */}
          {place.memo && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {place.memo}
            </p>
          )}

          {/* 예상비용 — cost가 있을 때만 표시, 천단위 콤마 포맷 */}
          {place.cost !== undefined && (
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Banknote className="h-3 w-3" aria-hidden="true" />
              {place.cost.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 우측 액션 컬럼 — 외부 링크/수정/삭제 버튼을 세로 배치 */}
        {/* gap-1.5로 고정 간격 */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {/* 외부 링크 버튼 — url 유무에 관계없이 동일 공간 차지 (삭제버튼 위치 고정) */}
          <div className="h-7 w-7 flex items-center justify-center">
            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                aria-label={`${place.name} 외부 링크 열기`}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
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
      </div>
    </div>
  )
}
