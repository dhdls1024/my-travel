// date-fns: 날짜 계산 및 포맷팅 유틸리티 라이브러리
// parseISO — ISO 8601 문자열을 Date 객체로 변환
// differenceInDays — 두 날짜 사이의 일 수 차이 계산
// format — Date 객체를 지정된 포맷 문자열로 변환
import { differenceInDays, parseISO, format } from "date-fns"

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
  const today = new Date()
  const start = parseISO(startDate)
  const end = parseISO(endDate)

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
