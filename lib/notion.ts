// !! 서버 사이드 전용 모듈 !!
// 이 파일은 클라이언트 컴포넌트에서 import 하면 안 됩니다.
// (NOTION_API_KEY 등 민감한 환경변수가 브라우저에 노출됩니다)
// Next.js App Router의 서버 컴포넌트, Route Handler, generateMetadata에서만 사용하세요.

import { Client } from "@notionhq/client"
import type { Trip, Place } from "@/types/travel"

// Notion 클라이언트 싱글턴 초기화
// auth: 서버 환경변수에서만 접근 (클라이언트 번들에 포함되지 않음)
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Notion Trip DB에서 전체 여행 목록을 조회합니다.
// 정렬: 출발일 내림차순 (최신 여행 먼저 표시)
export async function getTrips(): Promise<Trip[]> {
  // TODO: notion.databases.query() 호출
  // const response = await notion.databases.query({
  //   database_id: process.env.NOTION_TRIPS_DB_ID!,
  //   sorts: [{ property: "StartDate", direction: "descending" }],
  // })
  // return response.results.map(parseTrip)
  return []
}

// 특정 여행에 속한 장소 목록을 조회합니다.
// Relations 25개 제한 대응: start_cursor 기반 커서 페이지네이션 사용
export async function getPlaces(tripId: string): Promise<Place[]> {
  // TODO: notion.databases.query() + do-while 커서 페이지네이션 구현
  // let results = []
  // let cursor: string | undefined = undefined
  // do {
  //   const response = await notion.databases.query({
  //     database_id: process.env.NOTION_PLACES_DB_ID!,
  //     filter: { property: "Trip", relation: { contains: tripId } },
  //     start_cursor: cursor,
  //   })
  //   results.push(...response.results)
  //   cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  // } while (cursor)
  // return results.map(parsePlace)
  void tripId // TODO 구현 전 lint 경고 억제
  return []
}

// Notion API 응답을 Trip 타입으로 변환합니다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTrip(_page: any): Trip {
  // TODO: Notion Page 속성 파싱 구현
  throw new Error("parseTrip: 구현 예정")
}

// Notion API 응답을 Place 타입으로 변환합니다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePage(_page: any): Place {
  // TODO: Notion Page 속성 파싱 구현
  throw new Error("parsePage: 구현 예정")
}

// 모듈에서 사용되지 않는 함수 lint 경고 억제 (향후 사용 예정)
export { parseTrip, parsePage }
