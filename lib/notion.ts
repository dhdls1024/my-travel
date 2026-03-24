// !! 서버 사이드 전용 모듈 !!
// 이 파일은 클라이언트 컴포넌트에서 import 하면 안 됩니다.
// (NOTION_API_KEY 등 민감한 환경변수가 브라우저에 노출됩니다)
// Next.js App Router의 서버 컴포넌트, Route Handler, generateMetadata에서만 사용하세요.

import { Client, isNotionClientError, APIErrorCode, isFullPage } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Trip, Place, PlaceCategory, TripStatus, BusStop } from "@/types/travel"
import { searchPlaceCoords, searchAddressCoords } from "@/lib/kakao-local"

// ─── 상수 ────────────────────────────────────────────────────────────────────

// Rate Limit(429) 재시도 대기 시간(ms) — 지수 백오프 초기값
const RATE_LIMIT_INITIAL_DELAY = 1000

// 서버 에러(5xx) 재시도 대기 시간(ms) — 초기값
const SERVER_ERROR_INITIAL_DELAY = 500

// Rate Limit 최대 재시도 횟수
const RATE_LIMIT_MAX_RETRIES = 3

// 서버 에러 최대 재시도 횟수
const SERVER_ERROR_MAX_RETRIES = 2

// HTTP 상태 코드 기준값 — 5xx 서버 에러 판별
const SERVER_ERROR_MIN_STATUS = 500

// ─── 클라이언트 초기화 ────────────────────────────────────────────────────────

// Notion 클라이언트 싱글턴 초기화
// auth: 서버 환경변수에서만 접근 (클라이언트 번들에 포함되지 않음)
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// ─── 재시도 유틸리티 ──────────────────────────────────────────────────────────

/**
 * 지정된 ms만큼 비동기 대기한다.
 * @param ms - 대기 시간 (밀리초)
 */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Notion API 호출에 지수 백오프 재시도 로직을 적용하는 래퍼 함수.
 *
 * - 429 (Rate Limit): 1s → 2s → 4s 지수 백오프, 최대 3회 재시도
 * - 5xx (서버 에러): 0.5s → 1s 재시도, 최대 2회
 * - 401 (인증 실패): 즉시 throw (재시도해도 의미 없음)
 * - 그 외 오류: 즉시 throw
 *
 * @param fn - 실행할 Notion API 호출 함수
 * @returns API 응답 결과
 */
async function fetchWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let rateLimitAttempts = 0
  let serverErrorAttempts = 0

  // 재시도가 남아있는 동안 반복
  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (!isNotionClientError(error)) throw error

      // 인증 실패는 재시도 무의미 — 즉시 throw
      if (error.code === APIErrorCode.Unauthorized) throw error

      // Rate Limit 처리 — 지수 백오프
      if (error.code === APIErrorCode.RateLimited) {
        if (rateLimitAttempts >= RATE_LIMIT_MAX_RETRIES) throw error
        const delay = RATE_LIMIT_INITIAL_DELAY * Math.pow(2, rateLimitAttempts)
        rateLimitAttempts++
        await sleep(delay)
        continue
      }

      // 5xx 서버 에러 처리
      const status = (error as { status?: number }).status ?? 0
      if (status >= SERVER_ERROR_MIN_STATUS) {
        if (serverErrorAttempts >= SERVER_ERROR_MAX_RETRIES) throw error
        const delay = SERVER_ERROR_INITIAL_DELAY * Math.pow(2, serverErrorAttempts)
        serverErrorAttempts++
        await sleep(delay)
        continue
      }

      // 그 외 오류는 즉시 throw
      throw error
    }
  }
}

// ─── 파싱 헬퍼 ────────────────────────────────────────────────────────────────

// isFullPage — @notionhq/client에서 제공하는 공식 타입 가드
// Notion API query 결과에서 완전한 PageObjectResponse만 필터링한다.
// (PartialPageObjectResponse, DatabaseObjectResponse 등 제외)

/**
 * Notion title 속성에서 텍스트 문자열을 추출한다.
 * @param prop - Notion 속성 객체
 * @returns 텍스트 문자열 (없으면 빈 문자열)
 */
function extractTitle(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "title") return ""
  return prop.title.map((t) => t.plain_text).join("") ?? ""
}

/**
 * Notion rich_text 속성에서 텍스트 문자열을 추출한다.
 * @param prop - Notion 속성 객체
 * @returns 텍스트 문자열 (없으면 빈 문자열)
 */
function extractRichText(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "rich_text") return ""
  return prop.rich_text.map((t) => t.plain_text).join("") ?? ""
}

/**
 * Notion date 속성에서 start 날짜 문자열을 추출한다.
 * @param prop - Notion 속성 객체
 * @returns ISO 8601 날짜 문자열 (없으면 undefined)
 */
function extractDate(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "date") return undefined
  return prop.date?.start ?? undefined
}

/**
 * Notion date 속성에서 end 날짜 문자열을 추출한다.
 * Notion에서 날짜 범위(시작~종료)로 입력한 경우에만 값이 존재한다.
 * @param prop - Notion 속성 객체
 * @returns ISO 8601 날짜 문자열 (범위 날짜가 없으면 undefined)
 */
function extractDateEnd(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "date") return undefined
  return prop.date?.end ?? undefined
}

/**
 * Notion select 속성에서 선택값 이름을 추출한다.
 * @param prop - Notion 속성 객체
 * @returns 선택값 문자열 (없으면 undefined)
 */
function extractSelect(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "select") return undefined
  return prop.select?.name ?? undefined
}

/**
 * Notion status 속성에서 상태값 이름을 추출한다.
 * status 타입은 select와 별도 타입이므로 별도 헬퍼 필요
 * @param prop - Notion 속성 객체
 * @returns 상태값 문자열 (없으면 undefined)
 */
function extractStatus(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "status") return undefined
  return prop.status?.name ?? undefined
}

/**
 * Notion files 속성에서 첫 번째 파일 URL을 추출한다.
 * type이 "file"(Notion 업로드)이면 file.url, "external"이면 external.url 반환
 * @param prop - Notion 속성 객체
 * @returns URL 문자열 (없으면 undefined)
 */
function extractFileUrl(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "files") return undefined
  const first = prop.files[0]
  if (!first) return undefined
  if (first.type === "file") return first.file.url
  if (first.type === "external") return first.external.url
  return undefined
}

/**
 * Notion url 속성에서 URL 문자열을 추출한다.
 * @param prop - Notion 속성 객체
 * @returns URL 문자열 (없으면 undefined)
 */
function extractUrl(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "url") return undefined
  return prop.url ?? undefined
}

/**
 * Notion number 속성에서 숫자 값을 추출한다.
 * Notion에서 값이 비어 있으면 null이 반환되므로 undefined로 변환한다.
 * @param prop - Notion 속성 객체
 * @returns 숫자 값 (없으면 undefined)
 */
function extractNumber(
  prop: PageObjectResponse["properties"][string]
): number | undefined {
  if (prop.type !== "number") return undefined
  // Notion API는 빈 number를 null로 반환 — undefined로 정규화
  return prop.number ?? undefined
}

/**
 * Notion checkbox 속성에서 불리언 값을 추출한다.
 * 체크박스가 없거나 타입이 다르면 false를 기본값으로 반환한다.
 * @param prop - Notion 속성 객체
 * @returns 체크 여부 (기본값 false)
 */
function extractCheckbox(
  prop: PageObjectResponse["properties"][string]
): boolean {
  if (prop.type !== "checkbox") return false
  return prop.checkbox
}

/**
 * Notion relation 속성에서 첫 번째 관련 페이지 ID를 추출한다.
 * @param prop - Notion 속성 객체
 * @returns 페이지 ID 문자열 (없으면 빈 문자열)
 */
function extractRelationId(
  prop: PageObjectResponse["properties"][string]
): string {
  if (prop.type !== "relation") return ""
  return prop.relation[0]?.id ?? ""
}

/**
 * Notion 페이지 커버 이미지 URL을 추출한다.
 * cover 타입은 external(외부 URL) 또는 file(Notion 업로드)이 있다.
 * @param page - Notion 페이지 객체
 * @returns 이미지 URL (없으면 undefined)
 */
function extractCoverImage(page: PageObjectResponse): string | undefined {
  if (!page.cover) return undefined
  if (page.cover.type === "external") return page.cover.external.url
  if (page.cover.type === "file") return page.cover.file.url
  return undefined
}

// ─── 도메인 파서 ──────────────────────────────────────────────────────────────

/**
 * Notion API PageObjectResponse를 Trip 도메인 타입으로 변환한다.
 *
 * DB 컬럼 매핑:
 *   이름(title)  → title
 *   출발일(date) → startDate
 *   종료일(date) → endDate
 *   상태(select) → status
 *   page.cover   → coverImage
 *
 * @param page - Notion 페이지 응답 객체
 * @returns Trip 도메인 객체
 */
function parseTrip(page: PageObjectResponse): Trip {
  const props = page.properties

  return {
    id: page.id,
    // 실제 Notion DB 컬럼명: Name(title), StartDate(date), EndDate(date), Status(status), CoverImage(files)
    title: extractTitle(props["Name"]),
    startDate: extractDate(props["StartDate"]) ?? "",
    endDate: extractDate(props["EndDate"]) ?? "",
    // Status는 select가 아닌 status 타입 — extractStatus 사용
    status: (extractStatus(props["Status"]) ?? "계획중") as TripStatus,
    // CoverImage는 page.cover가 아닌 files 속성 컬럼으로 저장됨
    coverImage: extractFileUrl(props["CoverImage"]),
  }
}

/**
 * Notion API PageObjectResponse를 Place 도메인 타입으로 변환한다.
 *
 * DB 컬럼 매핑:
 *   이름(title)          → name
 *   카테고리(select)     → category
 *   위도(number)         → latitude
 *   경도(number)         → longitude
 *   메모(rich_text)      → memo
 *   URL(url)             → url
 *   방문일(date)         → visitDate
 *   여행(relation[0].id) → tripId
 *
 * @param page - Notion 페이지 응답 객체
 * @returns Place 도메인 객체
 */
function parsePlace(page: PageObjectResponse): Place {
  const props = page.properties

  return {
    id: page.id,
    // 실제 Notion DB 컬럼명: Name(title), Category(select), trips(relation)
    // VisitDate(date), Memo(rich_text), URL(url)
    // 위경도는 Notion DB에 저장하지 않음 — getPlaces()에서 카카오 로컬 API로 자동 보완
    name: extractTitle(props["Name"]),
    // 카테고리 기본값: "명소" — DB에 값이 없을 때 지도 마커 표시 보장
    category: (extractSelect(props["Category"]) ?? "명소") as PlaceCategory,
    tripId: extractRelationId(props["trips"]),
    visitDate: extractDate(props["VisitDate"]),
    // 숙소처럼 체크인~체크아웃 기간을 날짜 범위로 입력한 경우 end 날짜도 저장
    visitDateEnd: extractDateEnd(props["VisitDate"]),
    // "null" 문자열은 빈 값으로 처리 — Notion DB에 "null"로 입력된 경우 방어
    memo: extractRichText(props["Memo"]).trim().replace(/^null$/i, "") || undefined,
    // Address: rich_text 타입 — BusStop의 parseBusStop과 동일 패턴
    // Notion DB에 Address 컬럼이 없어도 extractRichText가 "" 반환하므로 안전
    address: extractRichText(props["Address"]).trim() || undefined,
    url: extractUrl(props["URL"]),
    // Cost: 예상 비용 (선택) — 입력되지 않으면 undefined
    cost: extractNumber(props["Cost"]),
    // CheckBox: 방문 완료 여부 등 체크용 — 기본값 false
    checked: extractCheckbox(props["CheckBox"]),
  }
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * Notion Trip DB에서 전체 여행 목록을 조회한다.
 *
 * - 정렬: 출발일 내림차순 (최신 여행 먼저)
 * - ISR revalidate: 60s (Next.js 서버 컴포넌트에서 호출 시 자동 적용)
 * - Rate Limit 대응: fetchWithRetry 래퍼 사용
 *
 * @returns Trip 배열
 */
export async function getTrips(): Promise<Trip[]> {
  const response = await fetchWithRetry(() =>
    notion.databases.query({
      database_id: process.env.NOTION_TRIPS_DB_ID!,
      sorts: [{ property: "StartDate", direction: "descending" }],
    })
  )

  return response.results
    .filter(isFullPage)
    .map(parseTrip)
}

/**
 * 특정 여행에 속한 장소 목록을 전부 조회한다.
 *
 * - Relations 25개 제한 대응: do-while + start_cursor 커서 페이지네이션
 * - filter: "여행" relation이 tripId를 포함하는 항목만 조회
 * - 위경도 없는 장소: 카카오 로컬 API로 자동 보완 (병렬 처리)
 *
 * @param tripId - 조회할 여행의 Notion 페이지 ID
 * @returns Place 배열 (위경도 보완 완료)
 */
export async function getPlaces(tripId: string): Promise<Place[]> {
  const allResults: PageObjectResponse[] = []
  let cursor: string | undefined = undefined

  // 다음 페이지가 없을 때까지 반복 조회
  do {
    const response = await fetchWithRetry(() =>
      notion.databases.query({
        database_id: process.env.NOTION_PLACES_DB_ID!,
        filter: {
          property: "trips",
          relation: { contains: tripId },
        },
        // cursor가 undefined이면 첫 페이지 조회
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    )

    const fullPages = response.results.filter(isFullPage)
    allResults.push(...fullPages)

    // has_more가 true이고 next_cursor가 있으면 다음 페이지 조회
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  const places = allResults.map(parsePlace)

  // 위경도 없는 장소만 카카오 로컬 API로 보완 (병렬 처리)
  // — Promise.all로 병렬 실행하여 순차 호출보다 빠르게 처리
  const enriched = await Promise.all(
    places.map(async (place) => {
      // 위경도가 이미 있으면 그대로 반환 — 불필요한 API 호출 방지
      if (place.latitude && place.longitude) return place

      // address가 있으면 주소 검색 우선 — 동명이인 장소 오탐 방지
      // 주소 검색 실패 시 장소명 키워드 검색으로 폴백 (기존 방식 유지)
      let coords = place.address
        ? await searchAddressCoords(place.address)
        : null

      if (!coords) {
        coords = await searchPlaceCoords(place.name)
      }

      if (!coords) return place
      return { ...place, latitude: coords.lat, longitude: coords.lng }
    })
  )

  // visitDate 오름차순 정렬 — 날짜 없는 항목은 맨 뒤로
  return enriched.sort((a, b) => {
    if (!a.visitDate && !b.visitDate) return 0
    if (!a.visitDate) return 1
    if (!b.visitDate) return -1
    return a.visitDate.localeCompare(b.visitDate)
  })
}

// ─── 투어버스 정류장 파서 ──────────────────────────────────────────────────────

/**
 * Notion API PageObjectResponse를 BusStop 도메인 타입으로 변환한다.
 *
 * DB 컬럼 매핑:
 *   Order(number)    → order
 *   Name(title)      → name
 *   Address(rich_text) → address
 *   URL(url)         → url
 *
 * @param page - Notion 페이지 응답 객체
 * @returns BusStop 도메인 객체 (위경도 미포함 — getBusStops에서 보완)
 */
function parseBusStop(page: PageObjectResponse): BusStop {
  const props = page.properties

  return {
    id: page.id,
    name: extractTitle(props["Name"]),
    address: extractRichText(props["Address"]),
    // Order가 없는 경우 0으로 폴백 — null 반환 방어
    order: extractNumber(props["Order"]) ?? 0,
    url: extractUrl(props["URL"]),
    // time: 운행 시간 정보 — rich_text 컬럼 ("1회: 09:40 / 2회: 10:40 ..." 형식)
    time: extractRichText(props["time"]).trim() || undefined,
  }
}

/**
 * 특정 여행에 속한 투어버스 정류장 목록을 전부 조회한다.
 *
 * - Relations 25개 제한 대응: do-while + start_cursor 커서 페이지네이션
 * - filter: "trips" relation이 tripId를 포함하는 항목만 조회
 * - Address 컬럼값으로 카카오 로컬 API 좌표 자동 보완 (병렬 처리)
 * - order 오름차순 정렬 후 반환
 *
 * @param tripId - 조회할 여행의 Notion 페이지 ID
 * @returns BusStop 배열 (위경도 보완 완료, order 오름차순)
 */
export async function getBusStops(tripId: string): Promise<BusStop[]> {
  const allResults: PageObjectResponse[] = []
  let cursor: string | undefined = undefined

  // 다음 페이지가 없을 때까지 반복 조회
  do {
    const response = await fetchWithRetry(() =>
      notion.databases.query({
        database_id: process.env.NOTION_BUS_STOPS_DB_ID!,
        filter: {
          property: "trips",
          relation: { contains: tripId },
        },
        // cursor가 undefined이면 첫 페이지 조회
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    )

    const fullPages = response.results.filter(isFullPage)
    allResults.push(...fullPages)

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  const busStops = allResults.map(parseBusStop)

  // Address(지번 주소)로 카카오 주소 검색 API 좌표 보완 (병렬 처리)
  // — searchAddressCoords 사용: address 컬럼은 장소명이 아닌 지번 주소이므로
  //   키워드 검색(searchPlaceCoords)이 아닌 주소 검색 API가 정확함
  const enriched = await Promise.all(
    busStops.map(async (stop) => {
      if (stop.latitude && stop.longitude) return stop
      if (!stop.address) return stop
      const coords = await searchAddressCoords(stop.address)
      if (!coords) return stop
      return { ...stop, latitude: coords.lat, longitude: coords.lng }
    })
  )

  // order 오름차순 정렬 — Notion DB 조회 순서와 무관하게 항상 일관된 순서 보장
  return enriched.sort((a, b) => a.order - b.order)
}
