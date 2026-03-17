// 환경변수 및 Notion API 연결 테스트 페이지
// 실제 개발 전 DB 연결 상태를 빠르게 확인하기 위한 임시 페이지
import { Client } from "@notionhq/client"

// Notion 클라이언트 초기화 (서버 컴포넌트에서만 사용)
const notion = new Client({ auth: process.env.NOTION_API_KEY })

async function fetchTrips() {
  const res = await notion.databases.query({
    database_id: process.env.NOTION_TRIPS_DB_ID!,
    page_size: 10,
  })
  return res.results
}

async function fetchPlaces() {
  const res = await notion.databases.query({
    database_id: process.env.NOTION_PLACES_DB_ID!,
    page_size: 10,
  })
  return res.results
}

export default async function TestPage() {
  // 환경변수 존재 여부 체크
  const envStatus = {
    NOTION_API_KEY: !!process.env.NOTION_API_KEY,
    NOTION_TRIPS_DB_ID: !!process.env.NOTION_TRIPS_DB_ID,
    NOTION_PLACES_DB_ID: !!process.env.NOTION_PLACES_DB_ID,
    NEXT_PUBLIC_KAKAO_MAP_APP_KEY: !!process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY,
  }

  // API 호출 결과 (실패 시 에러 메시지 캡처)
  let trips: unknown[] = []
  let places: unknown[] = []
  let tripsError: string | null = null
  let placesError: string | null = null

  try {
    trips = await fetchTrips()
  } catch (e) {
    tripsError = e instanceof Error ? e.message : String(e)
  }

  try {
    places = await fetchPlaces()
  } catch (e) {
    placesError = e instanceof Error ? e.message : String(e)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold">환경변수 & Notion API 테스트</h1>

      {/* 환경변수 상태 */}
      <section className="rounded-lg border p-5 space-y-3">
        <h2 className="font-semibold text-lg">환경변수 상태</h2>
        <ul className="space-y-1 text-sm font-mono">
          {Object.entries(envStatus).map(([key, ok]) => (
            <li key={key} className="flex items-center gap-2">
              <span className={ok ? "text-green-600" : "text-red-500"}>
                {ok ? "✓" : "✗"}
              </span>
              <span>{key}</span>
              <span className={ok ? "text-green-600" : "text-red-500"}>
                {ok ? "설정됨" : "누락"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Trips DB */}
      <section className="rounded-lg border p-5 space-y-3">
        <h2 className="font-semibold text-lg">
          Trips DB{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({trips.length}건)
          </span>
        </h2>

        {tripsError ? (
          <p className="text-sm text-red-500 font-mono bg-red-50 rounded p-3">
            {tripsError}
          </p>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">데이터 없음</p>
        ) : (
          <pre className="text-xs overflow-auto bg-muted rounded p-3 max-h-72">
            {JSON.stringify(trips, null, 2)}
          </pre>
        )}
      </section>

      {/* Places DB */}
      <section className="rounded-lg border p-5 space-y-3">
        <h2 className="font-semibold text-lg">
          Places DB{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({places.length}건)
          </span>
        </h2>

        {placesError ? (
          <p className="text-sm text-red-500 font-mono bg-red-50 rounded p-3">
            {placesError}
          </p>
        ) : places.length === 0 ? (
          <p className="text-sm text-muted-foreground">데이터 없음</p>
        ) : (
          <pre className="text-xs overflow-auto bg-muted rounded p-3 max-h-72">
            {JSON.stringify(places, null, 2)}
          </pre>
        )}
      </section>
    </main>
  )
}
