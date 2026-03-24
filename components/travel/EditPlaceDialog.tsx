"use client"

// EditPlaceDialog: 기존 장소 데이터를 폼에 채워 수정하는 다이얼로그 컴포넌트
// AddPlaceDialog와 달리 DialogTrigger 없이 open/onOpenChange props로 외부 제어
// React Hook Form + Zod 유효성 검사, /api/places/[id] PATCH 호출
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import type { UseFormRegister, Control, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORY_LIST, MARKER_COLORS } from "@/lib/constants"
import type { Place, PlaceCategory } from "@/types/travel"

// ─── Zod 스키마 ───────────────────────────────────────────────────────────────

// 장소 수정 폼 유효성 검사 스키마
// cost는 string으로 받아 onSubmit에서 number로 변환 — z.preprocess/coerce의 Zod v4 타입 추론 문제 우회
// url은 빈 문자열('')도 유효 — 입력하지 않은 경우 허용
const editPlaceSchema = z.object({
  name: z.string().min(1, "장소명을 입력하세요").max(100),
  category: z.enum(["교통", "숙소", "맛집", "명소", "카페"]),
  visitDate: z.string().optional(),
  visitDateEnd: z.string().optional(),
  memo: z.string().max(2000).optional(),
  // address: 도로명/지번 주소 — 있으면 좌표 조회 우선 사용, 없으면 장소명 검색 폴백
  address: z.string().max(200).optional(),
  url: z
    .string()
    .url("올바른 URL을 입력하세요")
    .optional()
    .or(z.literal("")),
  // input[type=number] 값은 항상 string으로 전달 → onSubmit에서 변환
  costRaw: z.string().optional(),
})

type EditPlaceFormValues = z.infer<typeof editPlaceSchema>

// ─── Props 타입 ───────────────────────────────────────────────────────────────

interface EditPlaceDialogProps {
  // 수정 대상 장소 전체 객체 — defaultValues 및 PATCH URL에 사용
  place: Place
  // 장소가 속한 여행 ID — revalidatePath 쿼리 파라미터로 전달
  tripId: string
  // 다이얼로그 열림 상태 — 외부에서 제어 (controlled)
  open: boolean
  // 열림 상태 변경 핸들러 — 부모 컴포넌트에서 상태 업데이트
  onOpenChange: (open: boolean) => void
}

interface CategoryOptionProps {
  // 카테고리명 — MARKER_COLORS 키와 일치해야 함
  category: PlaceCategory
}

interface FormFieldWrapperProps {
  // 필드 레이블 텍스트
  label: string
  // htmlFor — input id와 연결되는 label 속성
  htmlFor: string
  // 필수 필드 여부 — true일 때 레이블 옆에 * 표시
  required?: boolean
  children: React.ReactNode
}

interface FormFieldsProps {
  register: UseFormRegister<EditPlaceFormValues>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<EditPlaceFormValues, any>
  errors: FieldErrors<EditPlaceFormValues>
  isLoading: boolean
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

// CategoryOption: Select 옵션에 카테고리 색상 dot + 이름을 함께 렌더링
function CategoryOption({ category }: CategoryOptionProps) {
  return (
    <span className="flex items-center gap-2">
      {/* 카테고리별 마커 색상에 맞춘 원형 dot — inline style로 동적 색상 적용 */}
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: MARKER_COLORS[category] }}
        aria-hidden="true"
      />
      {category}
    </span>
  )
}

// FormFieldWrapper: 레이블 + 필수 표시(*) + 입력 요소를 감싸는 공통 래퍼
function FormFieldWrapper({
  label,
  htmlFor,
  required,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {/* 필수 필드 표시 — 접근성을 위해 aria-hidden으로 보조 기술에서 숨김 */}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
    </div>
  )
}

// FormFields: 폼 내 모든 입력 필드를 렌더링하는 서브 컴포넌트
// 30줄 규칙 준수를 위해 EditPlaceDialog에서 분리
function FormFields({ register, control, errors, isLoading }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* 1. 장소명 — 필수 */}
      <FormFieldWrapper label="장소명" htmlFor="edit-name" required>
        <Input
          id="edit-name"
          placeholder="장소명을 입력하세요"
          disabled={isLoading}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "edit-name-error" : undefined}
          {...register("name")}
        />
        {/* 장소명 에러 메시지 — 필수 필드이므로 에러 표시 */}
        {errors.name && (
          <p id="edit-name-error" className="text-xs text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </FormFieldWrapper>

      {/* 1-1. 주소 — 선택, 지도 마커 좌표 정확도 개선용 (입력 시 장소명보다 우선 검색) */}
      <FormFieldWrapper label="주소" htmlFor="edit-address">
        <Input
          id="edit-address"
          placeholder="미입력시 장소명으로 검색"
          disabled={isLoading}
          {...register("address")}
        />
      </FormFieldWrapper>

      {/* 2. 카테고리 — shadcn Select는 RHF register 직접 사용 불가, Controller 사용 */}
      <FormFieldWrapper label="카테고리" htmlFor="edit-category">
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isLoading}
            >
              <SelectTrigger id="edit-category" aria-label="카테고리 선택">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {/* CATEGORY_LIST 순서 고정 — 객체 키 순서 비보장 대응 */}
                {CATEGORY_LIST.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <CategoryOption category={cat} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormFieldWrapper>

      {/* 3. 방문 날짜 / 종료일 — 2열 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <FormFieldWrapper label="방문 날짜" htmlFor="edit-visitDate">
          <Input
            id="edit-visitDate"
            type="date"
            disabled={isLoading}
            {...register("visitDate")}
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="종료일" htmlFor="edit-visitDateEnd">
          <Input
            id="edit-visitDateEnd"
            type="date"
            disabled={isLoading}
            {...register("visitDateEnd")}
          />
        </FormFieldWrapper>
      </div>

      {/* 4. 메모 — 선택 */}
      <FormFieldWrapper label="메모" htmlFor="edit-memo">
        <Textarea
          id="edit-memo"
          placeholder="메모를 입력하세요"
          rows={3}
          disabled={isLoading}
          className="resize-none"
          {...register("memo")}
        />
      </FormFieldWrapper>

      {/* 5. 링크 — 선택, 빈 문자열도 유효 (.or(z.literal(''))) */}
      <FormFieldWrapper label="링크" htmlFor="edit-url">
        <Input
          id="edit-url"
          type="url"
          placeholder="https://..."
          disabled={isLoading}
          aria-invalid={!!errors.url}
          {...register("url")}
        />
        {errors.url && (
          <p className="text-xs text-destructive" role="alert">
            {errors.url.message}
          </p>
        )}
      </FormFieldWrapper>

      {/* 6. 예상 비용 — 선택, costRaw(string)로 받아 onSubmit에서 number 변환 */}
      <FormFieldWrapper label="예상 비용" htmlFor="edit-costRaw">
        <Input
          id="edit-costRaw"
          type="number"
          min="0"
          placeholder="0"
          disabled={isLoading}
          {...register("costRaw")}
        />
      </FormFieldWrapper>
    </div>
  )
}

// ─── submit 핸들러 팩토리 ─────────────────────────────────────────────────────

interface MakeEditSubmitHandlerOptions {
  // 수정 대상 장소 — id와 함께 PATCH URL 구성에 사용
  place: Place
  // 여행 ID — revalidatePath 쿼리 파라미터로 서버에 전달
  tripId: string
  // API 요청 중 로딩 상태 제어
  setIsLoading: (v: boolean) => void
  // router.refresh(): 서버 컴포넌트 재렌더 트리거 (TanStack Query 미사용 구간)
  routerRefresh: () => void
  // 수정 완료 후 다이얼로그 닫기
  onOpenChange: (open: boolean) => void
}

// makeEditSubmitHandler: onSubmit 로직을 별도 팩토리 함수로 분리 (30줄 규칙 준수)
// PATCH /api/places/[id]?tripId=[tripId] → router.refresh() → toast → 다이얼로그 닫기
function makeEditSubmitHandler(opts: MakeEditSubmitHandlerOptions) {
  return async (data: EditPlaceFormValues) => {
    opts.setIsLoading(true)
    try {
      // costRaw(string) → cost(number | undefined) 변환
      const cost =
        data.costRaw !== undefined && data.costRaw !== ""
          ? Number(data.costRaw)
          : undefined

      const res = await fetch(
        `/api/places/${opts.place.id}?tripId=${opts.tripId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            category: data.category,
            visitDate: data.visitDate,
            visitDateEnd: data.visitDateEnd,
            memo: data.memo,
            address: data.address,
            url: data.url,
            costRaw: data.costRaw,
            cost,
          }),
        }
      )

      if (!res.ok) throw new Error()

      // 서버 컴포넌트 캐시 갱신 — TanStack Query invalidateQueries 미사용 구간
      opts.routerRefresh()
      toast.success("수정되었습니다")
      opts.onOpenChange(false)
    } catch {
      // 네트워크 오류 또는 서버 에러 발생 시
      toast.error("수정에 실패했습니다")
    } finally {
      opts.setIsLoading(false)
    }
  }
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

// EditPlaceDialog: controlled 방식 다이얼로그 — DialogTrigger 없이 open props로 열림 제어
// open=true 진입 시마다 최신 place 데이터로 폼을 초기화해 stale 데이터 방지
export function EditPlaceDialog({
  place,
  tripId,
  open,
  onOpenChange,
}: EditPlaceDialogProps) {
  // API 요청 중 로딩 상태 — 버튼 비활성화 및 스피너에 사용
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  // place 객체의 기존 데이터로 폼 defaultValues 구성
  const defaultValues = {
    name: place.name,
    category: place.category,
    visitDate: place.visitDate ?? "",
    visitDateEnd: place.visitDateEnd ?? "",
    memo: place.memo ?? "",
    address: place.address ?? "",
    url: place.url ?? "",
    // cost가 undefined이면 빈 문자열 — input[type=number]와 호환
    costRaw: place.cost !== undefined ? String(place.cost) : "",
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPlaceFormValues>({
    resolver: zodResolver(editPlaceSchema),
    defaultValues,
  })

  // open=true 시마다 최신 place 데이터로 폼 초기화
  // place prop이 변경되어도 다이얼로그가 닫혀 있으면 reset 불필요 — open 감지로 처리
  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = handleSubmit(
    makeEditSubmitHandler({
      place,
      tripId,
      setIsLoading,
      routerRefresh: () => router.refresh(),
      onOpenChange,
    })
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>장소 수정</DialogTitle>
          <DialogDescription>장소 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <FormFields
            register={register}
            control={control}
            errors={errors}
            isLoading={isLoading}
          />

          <DialogFooter className="mt-6">
            {/* 취소 버튼 — 로딩 중 비활성화, 클릭 시 다이얼로그 닫기 */}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>

            {/* 수정하기 버튼 — 로딩 중 스피너 표시 */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  저장 중...
                </>
              ) : (
                "수정하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
