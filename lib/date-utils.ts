// date-fns: 날짜 계산 및 포맷팅 유틸리티 라이브러리
// parseISO — ISO 8601 문자열을 Date 객체로 변환
// differenceInDays — 두 날짜 사이의 일 수 차이 계산
// format — Date 객체를 지정된 포맷 문자열로 변환
import { differenceInDays, parseISO, format } from "date-fns"

// date-fns-tz: 타임존 변환 유틸리티 라이브러리
// toZonedTime — UTC Date → 특정 시간대 Date 변환 (표시용)
// fromZonedTime — 특정 시간대 Date → UTC Date 변환 (저장/필터용)
import { toZonedTime, fromZonedTime } from "date-fns-tz"

// Notion date 속성 및 KST 필터 기준 시간대 상수
const TIMEZONE_SEOUL = "Asia/Seoul"

// D-Day 문자열 반환값 상수 — 매직 스트링 방지
const DDAY_TODAY = "D-Day"
const DDAY_TRAVELING = "여행중"

/**
 * 여행 출발일까지 남은 D-Day 문자열을 반환한다.
 *
 * @param startDate - 출발일 (ISO 8601, 예: "2026-04-10")
 * @param endDate   - 종료일 (ISO 8601, 예: "2026-04-13") — 여행중 판단에 사용
 * @returns "D-3" | "D-Day" | "D+5" | "여행중"
 *
 * 설계 결정:
 * - startDate만으로는 "여행중" 상태를 판별할 수 없어 endDate도 받는다.
 * - differenceInDays는 시간을 무시하고 자정 기준으로 계산하므로 날짜만 비교하는 이 용도에 적합.
 * - 양수 = 출발 전(D-N), 0 = 당일, 음수 = 출발 후(D+N 또는 여행중/완료)
 */
export function calculateDday(startDate: string, endDate: string): string {
  // KST 기준 오늘 날짜를 구하기 위해 toZonedTime으로 변환 후 시간을 자정으로 리셋
  // new Date()를 그대로 쓰면 UTC 기준이라 KST 오전 9시 이후 날짜가 하루 밀릴 수 있음
  const nowKst = toZonedTime(new Date(), TIMEZONE_SEOUL)
  const today = new Date(nowKst.getFullYear(), nowKst.getMonth(), nowKst.getDate())

  // parseISO("2026-04-03")는 UTC 자정으로 해석되므로 동일하게 날짜만 추출해 비교
  const startRaw = parseISO(startDate)
  const start = new Date(startRaw.getFullYear(), startRaw.getMonth(), startRaw.getDate())
  const endRaw = parseISO(endDate)
  const end = new Date(endRaw.getFullYear(), endRaw.getMonth(), endRaw.getDate())

  // 오늘 기준으로 출발일까지 남은 일수 계산 (오늘 - 출발일 방향)
  // differenceInDays(a, b) = a - b (일 수)
  const diffFromStart = differenceInDays(start, today)
  const diffFromEnd = differenceInDays(end, today)

  if (diffFromStart > 0) {
    // 출발 전 — D-N
    return `D-${diffFromStart}`
  }

  if (diffFromStart === 0) {
    // 출발 당일
    return DDAY_TODAY
  }

  if (diffFromEnd >= 0) {
    // 출발일이 지났고 종료일이 오늘 이후 — 여행 중
    return DDAY_TRAVELING
  }

  // 종료일도 지남 — D+N (여행 완료 후 경과일)
  const elapsedDays = Math.abs(diffFromStart)
  return `D+${elapsedDays}`
}

/**
 * 여행 기간을 "YYYY.MM.DD ~ MM.DD" 형태로 포맷팅한다.
 * 출발·종료 연도가 다를 경우 종료일에도 연도를 포함한다.
 *
 * @param startDate - 출발일 (ISO 8601)
 * @param endDate   - 종료일 (ISO 8601)
 * @returns "2026.04.10 ~ 04.13" 또는 "2026.04.10 ~ 2027.01.05"
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  const startYear = format(start, "yyyy")
  const endYear = format(end, "yyyy")

  const formattedStart = format(start, "yyyy.MM.dd")

  // 같은 연도이면 종료일 연도 생략 — 중복 정보 제거
  const formattedEnd =
    startYear === endYear ? format(end, "MM.dd") : format(end, "yyyy.MM.dd")

  return `${formattedStart} ~ ${formattedEnd}`
}

/**
 * 출발일과 종료일을 받아 "N박 M일" 형태의 문자열을 반환한다.
 *
 * @param startDate - 출발일 (ISO 8601)
 * @param endDate   - 종료일 (ISO 8601)
 * @returns "3박 4일"
 *
 * 설계 결정:
 * - 박 수 = 종료일 - 출발일 (differenceInDays)
 * - 일 수 = 박 수 + 1 (당일치기 포함, 출발일도 1일로 계산)
 * - 당일치기(박=0)는 "0박 1일"로 반환
 */
export function calculateNights(startDate: string, endDate: string): string {
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  // 박 수 = 종료일 - 출발일 (절댓값으로 잘못된 순서 입력 방어)
  const nights = Math.max(0, differenceInDays(end, start))
  const days = nights + 1

  return `${nights}박 ${days}일`
}

/**
 * Notion date 속성 문자열을 Asia/Seoul 기준 Date 객체로 변환한다.
 *
 * Notion은 날짜를 "2026-04-10" 형식의 순수 날짜 문자열로 저장한다.
 * parseISO만 사용하면 로컬 타임존에 따라 결과가 달라지므로,
 * 명시적으로 Asia/Seoul 기준 자정(00:00:00)으로 변환한다.
 *
 * 설계 결정:
 * - parseISO("2026-04-10")은 시간 없는 날짜를 UTC 자정으로 해석하기 때문에
 *   KST(+9) 환경에서 표시하면 전날로 보일 수 있음.
 * - toZonedTime으로 Seoul 자정 기준 Date를 생성해 이 문제를 방지.
 *
 * @param dateStr - Notion date 속성 문자열 (예: "2026-04-10")
 * @returns Asia/Seoul 기준 자정 Date 객체
 */
export function parseNotionDate(dateStr: string): Date {
  // parseISO로 우선 Date 객체를 생성한 뒤 Seoul 시간대로 변환
  const utcDate = parseISO(dateStr)
  return toZonedTime(utcDate, TIMEZONE_SEOUL)
}

/**
 * Date 객체를 Notion filter에 사용할 ISO 8601 UTC 문자열로 변환한다.
 *
 * Notion API의 date filter는 UTC 기준 ISO 8601 문자열을 요구한다.
 * KST 기준 Date를 fromZonedTime으로 UTC로 역변환 후 toISOString()을 사용한다.
 *
 * 사용 예:
 *   KST 2026-04-10 00:00:00 → "2026-04-09T15:00:00.000Z" (UTC)
 *
 * 설계 결정:
 * - Notion filter에 KST Date를 직접 넣으면 UTC 기준으로 잘못된 날짜 범위를 조회하게 됨.
 * - fromZonedTime으로 "이 Date는 Seoul 시간대" 임을 명시해 올바른 UTC 값을 얻는다.
 *
 * @param date - Asia/Seoul 기준 Date 객체
 * @returns UTC 기준 ISO 8601 문자열 (예: "2026-04-09T15:00:00.000Z")
 */
export function formatDateForNotionFilter(date: Date): string {
  // Seoul 기준 date를 UTC로 역변환 후 ISO 문자열 반환
  const utcDate = fromZonedTime(date, TIMEZONE_SEOUL)
  return utcDate.toISOString()
}
