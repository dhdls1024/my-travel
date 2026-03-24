"use client"

// AddPlaceDialog: 여행 대시보드에서 새 장소를 추가하는 다이얼로그 컴포넌트
// React Hook Form + Zod 유효성 검사, /api/places POST 호출
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import type { UseFormRegister, Control, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { PlaceCategory } from "@/types/travel"

// ─── Zod 스키마 ───────────────────────────────────────────────────────────────

// 장소 추가 폼 유효성 검사 스키마
// cost는 string으로 받아 onSubmit에서 number로 변환 — z.preprocess/coerce의 Zod v4 타입 추론 문제 우회
// url은 빈 문자열('')도 유효 — 입력하지 않은 경우 허용
// category 기본값은 useForm defaultValues에서 처리 — Zod .default()는 optional 추론 유발
const addPlaceSchema = z.object({
  name: z.string().min(1, "장소명을 입력하세요").max(100),
  category: z.enum(["교통", "숙소", "맛집", "명소"]),
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

type AddPlaceFormValues = z.infer<typeof addPlaceSchema>

// ─── Props 타입 ───────────────────────────────────────────────────────────────

interface AddPlaceDialogProps {
  // 장소를 추가할 여행 ID (Notion tripId)
  tripId: string
  // 장소 등록 성공 후 외부 콜백 (선택)
  onSuccess?: () => void
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
  register: UseFormRegister<AddPlaceFormValues>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddPlaceFormValues, any>
  errors: FieldErrors<AddPlaceFormValues>
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
// 30줄 규칙 준수를 위해 AddPlaceDialog에서 분리
function FormFields({ register, control, errors, isLoading }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* 1. 장소명 — 필수 */}
      <FormFieldWrapper label="장소명" htmlFor="name" required>
        <Input
          id="name"
          placeholder="장소명을 입력하세요"
          disabled={isLoading}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {/* 장소명 에러 메시지 — 필수 필드이므로 에러 표시 */}
        {errors.name && (
          <p id="name-error" className="text-xs text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </FormFieldWrapper>

      {/* 1-1. 주소 — 선택, 지도 마커 좌표 정확도 개선용 (입력 시 장소명보다 우선 검색) */}
      <FormFieldWrapper label="주소" htmlFor="address">
        <Input
          id="address"
          placeholder="미입력시 장소명으로 검색"
          disabled={isLoading}
          {...register("address")}
        />
      </FormFieldWrapper>

      {/* 2. 카테고리 — shadcn Select는 RHF register 직접 사용 불가, Controller 사용 */}
      <FormFieldWrapper label="카테고리" htmlFor="category">
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isLoading}
            >
              <SelectTrigger id="category" aria-label="카테고리 선택">
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
        <FormFieldWrapper label="방문 날짜" htmlFor="visitDate">
          <Input
            id="visitDate"
            type="date"
            disabled={isLoading}
            {...register("visitDate")}
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="종료일" htmlFor="visitDateEnd">
          <Input
            id="visitDateEnd"
            type="date"
            disabled={isLoading}
            {...register("visitDateEnd")}
          />
        </FormFieldWrapper>
      </div>

      {/* 4. 메모 — 선택 */}
      <FormFieldWrapper label="메모" htmlFor="memo">
        <Textarea
          id="memo"
          placeholder="메모를 입력하세요"
          rows={3}
          disabled={isLoading}
          className="resize-none"
          {...register("memo")}
        />
      </FormFieldWrapper>

      {/* 5. 링크 — 선택, 빈 문자열도 유효 (.or(z.literal(''))) */}
      <FormFieldWrapper label="링크" htmlFor="url">
        <Input
          id="url"
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
      <FormFieldWrapper label="예상 비용" htmlFor="costRaw">
        <Input
          id="costRaw"
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

interface MakeSubmitHandlerOptions {
  tripId: string
  setIsLoading: (v: boolean) => void
  // router.refresh(): 서버 컴포넌트 재렌더 트리거 (TanStack Query 미사용 구간)
  routerRefresh: () => void
  reset: () => void
  setOpen: (v: boolean) => void
  onSuccess?: () => void
}

// makeSubmitHandler: onSubmit 로직을 별도 팩토리 함수로 분리 (30줄 규칙 준수)
// /api/places POST → router.refresh() → toast → 폼 초기화 → 다이얼로그 닫기
function makeSubmitHandler(opts: MakeSubmitHandlerOptions) {
  const { tripId, setIsLoading, routerRefresh, reset, setOpen, onSuccess } =
    opts

  return async (data: AddPlaceFormValues) => {
    setIsLoading(true)
    try {
      // costRaw(string) → cost(number | undefined) 변환
      const cost =
        data.costRaw !== undefined && data.costRaw !== ""
          ? Number(data.costRaw)
          : undefined

      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // costRaw 제외 후 cost(number)로 교체, tripId 추가해 Notion Relation 연결
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          visitDate: data.visitDate,
          visitDateEnd: data.visitDateEnd,
          memo: data.memo,
          address: data.address,
          url: data.url,
          cost,
          tripId,
        }),
      })

      if (!res.ok) throw new Error()

      // 서버 컴포넌트 캐시 갱신 — TanStack Query invalidateQueries 미사용 구간
      routerRefresh()
      toast.success("등록되었습니다")
      setOpen(false)
      reset()
      onSuccess?.()
    } catch {
      // 네트워크 오류 또는 서버 에러 발생 시
      toast.error("장소 등록에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

// AddPlaceDialog: 장소 추가 버튼 + 다이얼로그 폼 전체 컨테이너
export function AddPlaceDialog({ tripId, onSuccess }: AddPlaceDialogProps) {
  // 다이얼로그 열림/닫힘 상태
  const [open, setOpen] = useState(false)
  // API 요청 중 로딩 상태 — 버튼 비활성화 및 스피너에 사용
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPlaceFormValues>({
    resolver: zodResolver(addPlaceSchema),
    // category 기본값 설정 — Zod 스키마에서 .default() 미사용으로 인해 여기서 처리
    defaultValues: { category: "명소" },
  })

  const onSubmit = handleSubmit(
    makeSubmitHandler({
      tripId,
      setIsLoading,
      routerRefresh: () => router.refresh(),
      reset,
      setOpen,
      onSuccess,
    })
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          장소 추가
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>장소 추가</DialogTitle>
          <DialogDescription>새로운 방문 장소를 추가합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <FormFields
            register={register}
            control={control}
            errors={errors}
            isLoading={isLoading}
          />

          <DialogFooter className="mt-6">
            {/* 취소 버튼 — 로딩 중 비활성화 */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>

            {/* 저장 버튼 — 로딩 중 스피너 표시 */}
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
                "저장하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
