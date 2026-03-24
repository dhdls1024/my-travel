// DELETE /api/places/[placeId]
// Notion Place 페이지를 archived 처리(휴지통 이동)하는 Route Handler
// Notion API는 페이지 영구 삭제를 지원하지 않으므로 archived: true로 처리함
// 서버 사이드 전용 — NOTION_API_KEY는 절대 클라이언트에 노출되어서는 안 됨

import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"
import { Client, isNotionClientError, APIErrorCode } from "@notionhq/client"
import { z } from "zod"

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const MEMO_MAX_LENGTH = 2000
const ADDRESS_MAX_LENGTH = 200
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// ─── 스키마 ───────────────────────────────────────────────────────────────────

// PATCH 요청 body 검증 스키마 — name만 필수, 나머지는 부분 업데이트
const patchPlaceSchema = z.object({
  name: z.string().min(1, "장소명을 입력하세요").max(100),
  category: z.enum(["교통", "숙소", "맛집", "명소"]).optional(),
  visitDate: z.string().regex(DATE_REGEX).optional().or(z.literal("")),
  visitDateEnd: z.string().regex(DATE_REGEX).optional().or(z.literal("")),
  memo: z.string().max(MEMO_MAX_LENGTH).optional(),
  // address: 도로명/지번 주소 — 있으면 좌표 조회 우선 사용, 없으면 장소명 검색 폴백
  address: z.string().max(ADDRESS_MAX_LENGTH).optional(),
  url: z.string().url().optional().or(z.literal("")),
  costRaw: z.string().optional(),
})

type PatchPlaceInput = z.infer<typeof patchPlaceSchema>

// ─── Notion 클라이언트 ────────────────────────────────────────────────────────

// Notion 클라이언트 싱글턴 — 서버 사이드에서만 초기화됨
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────

/**
 * buildPatchProperties: 수정할 필드만 조건부로 포함 (부분 업데이트)
 * 전달받은 값이 있는 필드만 Notion properties에 포함 — 없는 필드는 기존값 유지
 *
 * @param data - patchPlaceSchema로 검증된 입력값
 * @returns Notion pages.update에 전달할 properties 객체
 */
function buildPatchProperties(data: PatchPlaceInput): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: data.name } }] },
  }

  if (data.category) {
    properties["Category"] = { select: { name: data.category } }
  }

  // visitDate 빈값('')이면 Notion 날짜 필드 제거 (null 전달)
  if (data.visitDate !== undefined) {
    if (data.visitDate === "") {
      properties["VisitDate"] = { date: null }
    } else {
      const end =
        data.visitDateEnd && data.visitDateEnd.length > 0
          ? data.visitDateEnd
          : null
      properties["VisitDate"] = { date: { start: data.visitDate, end } }
    }
  }

  // memo: 빈값이면 rich_text 빈 배열로 초기화
  if (data.memo !== undefined) {
    properties["Memo"] =
      data.memo.length > 0
        ? {
            rich_text: [
              { text: { content: data.memo.slice(0, MEMO_MAX_LENGTH) } },
            ],
          }
        : { rich_text: [] }
  }

  // url: 빈값이면 null로 초기화
  if (data.url !== undefined) {
    properties["URL"] = { url: data.url.length > 0 ? data.url : null }
  }

  // costRaw string → number 변환, 빈값이면 null
  if (data.costRaw !== undefined) {
    const cost = data.costRaw.length > 0 ? Number(data.costRaw) : null
    properties["Cost"] = { number: cost }
  }

  // address: 빈값이면 rich_text 빈 배열로 초기화 (컬럼 값 제거)
  if (data.address !== undefined) {
    properties["Address"] =
      data.address.length > 0
        ? { rich_text: [{ text: { content: data.address.slice(0, ADDRESS_MAX_LENGTH) } }] }
        : { rich_text: [] }
  }

  return properties
}

/**
 * Notion 클라이언트 에러를 적절한 HTTP Response로 변환한다.
 * isNotionClientError 타입 가드로 Notion 에러만 처리, 나머지는 null 반환.
 *
 * @param error - catch로 잡은 에러
 * @returns Notion 에러에 해당하는 Response, 아니면 null
 */
function handleNotionError(error: unknown): Response | null {
  if (!isNotionClientError(error)) return null

  // 401: Integration 토큰 인증 실패 또는 쓰기 권한 없음
  if (error.code === APIErrorCode.Unauthorized) {
    return Response.json(
      { error: "Notion 인증 실패. Integration 쓰기 권한을 확인하세요." },
      { status: 401 }
    )
  }

  // 404: placeId에 해당하는 페이지 없음 또는 접근 불가
  if (error.code === APIErrorCode.ObjectNotFound) {
    return Response.json(
      { error: "유효하지 않은 placeId입니다." },
      { status: 404 }
    )
  }

  // 429: Rate Limit 초과 — 잠시 후 재시도 안내
  if (error.code === APIErrorCode.RateLimited) {
    return Response.json(
      { error: "Notion Rate Limit. 잠시 후 다시 시도하세요." },
      { status: 429 }
    )
  }

  // validation_error: UUID 형식이 아닌 placeId 등 Notion API 입력값 오류
  if (error.code === APIErrorCode.ValidationError) {
    return Response.json(
      { error: "유효하지 않은 placeId입니다." },
      { status: 404 }
    )
  }

  return null
}

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * DELETE /api/places/[placeId]
 * Notion Place 페이지를 archived: true 로 업데이트해 휴지통으로 이동시킨다.
 * archived된 페이지는 DB 쿼리 결과에서 자동으로 제외된다.
 *
 * Query 파라미터:
 *   - tripId (선택): revalidatePath 대상 경로 결정용. 없으면 캐시 무효화 생략.
 *
 * 성공 응답: 200 + { success: true }
 * 실패 응답: 401(인증) / 404(placeId) / 429(Rate Limit) / 500(그 외)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  // 환경변수 누락 시 조기 종료 — 서버 설정 문제로 Notion 호출 불가
  if (!process.env.NOTION_API_KEY) {
    return Response.json({ error: "서버 설정 오류" }, { status: 500 })
  }

  // URL params에서 placeId 추출 (Next.js 15: params는 Promise)
  const { placeId } = await params

  // Query 파라미터에서 tripId 추출 — revalidatePath 리터럴 경로 생성에 사용
  const tripId = new URL(request.url).searchParams.get("tripId")

  try {
    // pages.update로 archived: true 설정 — Notion 휴지통 이동 (영구 삭제 API 없음)
    await notion.pages.update({
      page_id: placeId,
      archived: true,
    })

    // tripId가 있을 때만 캐시 무효화
    // 리터럴 경로 사용 필수 — '/travel/[tripId]' 패턴 문자열은 무효화 안 됨
    if (tripId) {
      revalidatePath(`/travel/${tripId}`)
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    // Notion 클라이언트 에러 분류 처리
    const notionResponse = handleNotionError(error)
    if (notionResponse) return notionResponse

    // 그 외 예상치 못한 에러 — 상세 정보는 서버 로그에만 기록
    console.error("[DELETE /api/places/[placeId]] 장소 삭제 실패:", error)
    return Response.json(
      { error: "장소 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/places/[placeId]
 * Notion Place 페이지의 properties를 부분 업데이트한다.
 * 전달된 필드만 업데이트하고 나머지 필드는 기존값 유지.
 *
 * Query 파라미터:
 *   - tripId (선택): revalidatePath 대상 경로 결정용
 *
 * 성공 응답: 200 + { id, name }
 * 실패 응답: 400(검증) / 401(인증) / 404(placeId) / 429(Rate Limit) / 500(그 외)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  // 환경변수 누락 시 조기 종료 — 서버 설정 문제로 Notion 호출 불가
  if (!process.env.NOTION_API_KEY) {
    return Response.json({ error: "서버 설정 오류" }, { status: 500 })
  }

  // URL params에서 placeId 추출 (Next.js 15: params는 Promise)
  const { placeId } = await params

  // Query 파라미터에서 tripId 추출 — revalidatePath 리터럴 경로 생성에 사용
  const tripId = new URL(request.url).searchParams.get("tripId")

  // request.json() 실패 시 400 반환 — 잘못된 JSON body 대응
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "검증 실패", details: [] }, { status: 400 })
  }

  // zod 스키마로 body 검증 — 실패 시 400 + 상세 오류 반환
  const parsed = patchPlaceSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "검증 실패", details: parsed.error.issues },
      { status: 400 }
    )
  }

  try {
    // 검증된 데이터로 Notion properties 구성 후 pages.update 호출
    await notion.pages.update({
      page_id: placeId,
      properties: buildPatchProperties(parsed.data) as Parameters<
        typeof notion.pages.update
      >[0]["properties"],
    })

    // tripId가 있을 때만 캐시 무효화
    // 리터럴 경로 사용 필수 — '/travel/[tripId]' 패턴 문자열은 무효화 안 됨
    if (tripId) {
      revalidatePath(`/travel/${tripId}`)
    }

    return Response.json({ id: placeId, name: parsed.data.name }, { status: 200 })
  } catch (error) {
    // Notion 클라이언트 에러 분류 처리
    const notionResponse = handleNotionError(error)
    if (notionResponse) return notionResponse

    // 그 외 예상치 못한 에러 — 상세 정보는 서버 로그에만 기록
    console.error("[PATCH /api/places/[placeId]] 장소 수정 실패:", error)
    return Response.json(
      { error: "장소 수정에 실패했습니다." },
      { status: 500 }
    )
  }
}
