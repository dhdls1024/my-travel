// POST /api/places
// Notion Places DB에 새 장소 레코드를 생성하는 Route Handler
// 서버 사이드 전용 — NOTION_API_KEY는 절대 클라이언트에 노출되어서는 안 됨

import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"
import { Client, isNotionClientError, APIErrorCode } from "@notionhq/client"
import { z } from "zod"

// ─── 상수 ────────────────────────────────────────────────────────────────────

// Notion rich_text 최대 허용 길이 (API 제한: 2000자)
const MEMO_MAX_LENGTH = 2000

// ─── Zod 스키마 ──────────────────────────────────────────────────────────────

// YYYY-MM-DD 형식 정규식
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * POST 요청 Body 검증 스키마
 * superRefine으로 visitDateEnd 의존성 교차 검증:
 *   - visitDate 없이 visitDateEnd만 입력하는 것은 논리적으로 불가
 */
const PlaceInputSchema = z
  .object({
    name: z.string().min(1).max(100),
    category: z.enum(["교통", "숙소", "맛집", "명소"]).default("명소"),
    tripId: z.string().min(1),
    // 빈 문자열('')도 허용 — 클라이언트 input[type=date] 미입력 시 빈 문자열 전달됨
    visitDate: z.string().regex(DATE_REGEX).optional().or(z.literal("")),
    visitDateEnd: z.string().regex(DATE_REGEX).optional().or(z.literal("")),
    memo: z.string().max(MEMO_MAX_LENGTH).optional(),
    // 빈 문자열('')도 허용 — 입력하지 않은 경우와 구분 없이 처리
    url: z.string().url().optional().or(z.literal("")),
    // cost: 0도 유효값이므로 undefined 체크 필수
    cost: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    // visitDate 없이 visitDateEnd만 입력한 경우 검증 실패
    if (data.visitDateEnd && !data.visitDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "visitDate가 없으면 visitDateEnd를 사용할 수 없습니다.",
        path: ["visitDateEnd"],
      })
    }
  })

// 스키마에서 타입 추론 — 별도 인터페이스 선언 중복 방지
type PlaceInput = z.infer<typeof PlaceInputSchema>

// ─── Notion 클라이언트 ────────────────────────────────────────────────────────

// Notion 클라이언트 싱글턴 — 서버 사이드에서만 초기화됨
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────

/**
 * 검증된 입력값으로 Notion pages.create에 전달할 properties 객체를 빌드한다.
 * 선택 필드(visitDate, memo, url, cost)는 값이 있을 때만 포함 — undefined 키 전달 방지
 *
 * @param input - Zod 검증 통과한 요청 데이터
 * @returns Notion CreatePageParameters['properties'] 호환 객체
 */
function buildPlaceProperties(input: PlaceInput): Record<string, unknown> {
  const { name, category, tripId, visitDate, visitDateEnd, memo, url, cost } =
    input

  const properties: Record<string, unknown> = {
    // title 타입: 배열 형태로 전달
    Name: { title: [{ text: { content: name } }] },
    // select 타입: name 필드로 선택값 지정
    Category: { select: { name: category } },
    // relation 타입: 배열 형식 필수 (단일 ID도 배열로 감싸야 함)
    trips: { relation: [{ id: tripId }] },
    // CheckBox 기본값 true — DashboardClient가 checked=true 장소만 지도 마커로 표시
    CheckBox: { checkbox: true },
  }

  // 방문일: visitDate 있을 때만 포함 (빈 문자열 제외), 범위 날짜도 빈 문자열 제외
  if (visitDate && visitDate.length > 0) {
    const end = visitDateEnd && visitDateEnd.length > 0 ? visitDateEnd : undefined
    properties["VisitDate"] = {
      date: {
        start: visitDate,
        ...(end ? { end } : {}),
      },
    }
  }

  // 메모: 값 있을 때만 포함 (빈 문자열 제외), MEMO_MAX_LENGTH 초과분은 slice로 안전 처리
  if (memo && memo.length > 0) {
    properties["Memo"] = {
      rich_text: [{ text: { content: memo.slice(0, MEMO_MAX_LENGTH) } }],
    }
  }

  // URL: 빈 문자열('')은 제외 — Notion URL 필드에 빈값 저장 방지
  if (url && url.length > 0) {
    properties["URL"] = { url }
  }

  // Cost: 0도 유효값 — undefined가 아닌지만 체크 (falsy 체크 금지)
  if (cost !== undefined) {
    properties["Cost"] = { number: cost }
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

  // 404: tripId에 해당하는 페이지 없음 또는 DB 접근 불가
  if (error.code === APIErrorCode.ObjectNotFound) {
    return Response.json(
      { error: "유효하지 않은 tripId입니다." },
      { status: 404 }
    )
  }

  // 429: Rate Limit 초과 — fetchWithRetry 재시도 소진 후 도달
  if (error.code === APIErrorCode.RateLimited) {
    return Response.json(
      { error: "Notion Rate Limit. 잠시 후 다시 시도하세요." },
      { status: 429 }
    )
  }

  // validation_error: UUID 형식이 아닌 tripId 등 Notion API 입력값 오류
  if (error.code === APIErrorCode.ValidationError) {
    return Response.json(
      { error: "유효하지 않은 tripId입니다." },
      { status: 404 }
    )
  }

  return null
}

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * POST /api/places
 * Notion Places DB에 새 장소를 생성하고 관련 캐시를 무효화한다.
 *
 * 성공 응답: 201 + { id, name }
 * 실패 응답: 400(검증) / 401(인증) / 404(tripId) / 429(Rate Limit) / 500(그 외)
 */
export async function POST(request: NextRequest) {
  // 환경변수 누락 시 조기 종료 — 서버 설정 문제로 Notion 호출 불가
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_PLACES_DB_ID) {
    return Response.json({ error: "서버 설정 오류" }, { status: 500 })
  }

  // 요청 Body 파싱 및 Zod 검증
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "검증 실패", details: [] }, { status: 400 })
  }

  const parsed = PlaceInputSchema.safeParse(body)
  if (!parsed.success) {
    // Zod 에러 details를 그대로 전달하여 클라이언트가 필드별 에러를 표시할 수 있게 함
    return Response.json(
      { error: "검증 실패", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const input = parsed.data

  try {
    // Notion pages.create: Places DB에 새 페이지(= 장소 레코드) 생성
    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_PLACES_DB_ID! },
      properties: buildPlaceProperties(input) as Parameters<
        typeof notion.pages.create
      >[0]["properties"],
    })

    // 성공 후 대시보드 페이지 캐시 무효화
    // 리터럴 경로 사용 필수 — '/travel/[tripId]' 패턴 문자열은 무효화 안 됨
    revalidatePath(`/travel/${input.tripId}`)

    return Response.json({ id: page.id, name: input.name }, { status: 201 })
  } catch (error) {
    // Notion 클라이언트 에러 분류 처리
    const notionResponse = handleNotionError(error)
    if (notionResponse) return notionResponse

    // 그 외 예상치 못한 에러 — 상세 정보는 서버 로그에만 기록
    console.error("[POST /api/places] 장소 등록 실패:", error)
    return Response.json(
      { error: "장소 등록에 실패했습니다." },
      { status: 500 }
    )
  }
}
