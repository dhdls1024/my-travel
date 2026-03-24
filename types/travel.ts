// 여행 플래너 도메인 타입 정의

// 투어버스 정류장 타입 — Notion Bus Stops DB 한 row에 해당
// 위경도는 Notion DB에 저장하지 않고 getBusStops()에서 카카오 로컬 API로 자동 보완
export interface BusStop {
  id: string
  name: string
  address: string
  order: number
  url?: string        // 네이버 지도 등 외부 URL (선택)
  time?: string       // 운행 시간 정보 — Notion time 컬럼 (rich_text)
  latitude?: number   // 위도 — 카카오 로컬 API로 자동 보완
  longitude?: number  // 경도 — 카카오 로컬 API로 자동 보완
}
// Place 카테고리 유니온 타입 — Notion DB 속성값과 1:1 매핑
export type PlaceCategory = "교통" | "숙소" | "맛집" | "명소"

// 여행 상태 유니온 타입 — Notion DB 속성값과 1:1 매핑
export type TripStatus = "계획중" | "확정" | "완료"

// 여행 인터페이스 — Notion Trip DB 한 row에 해당
export interface Trip {
  id: string
  title: string
  startDate: string // ISO 8601 (Asia/Seoul 기준)
  endDate: string   // ISO 8601 (Asia/Seoul 기준)
  status: TripStatus
  coverImage?: string // Notion 커버 이미지 URL (없을 수 있음)
}

// 장소 인터페이스 — Notion Place DB 한 row에 해당
// 실제 DB 컬럼: Name, Category, Address, Memo, URL, VisitDate, trips, Cost, CheckBox
// 위경도는 DB에 없음 — getPlaces()에서 Address(주소) 우선, 없으면 Name(장소명)으로 카카오 API 보완
export interface Place {
  id: string
  name: string
  category: PlaceCategory
  tripId: string        // Trip Relation ID (trips 컬럼)
  visitDate?: string    // 방문일 시작 (선택)
  visitDateEnd?: string // 방문일 종료 — Notion 날짜 범위 입력 시 사용 (선택)
  latitude?: number     // 위도 — 카카오 지도 마커 표시에 사용
  longitude?: number    // 경도 — 카카오 지도 마커 표시에 사용
  memo?: string         // 메모 (선택)
  address?: string      // 도로명/지번 주소 (선택) — 있으면 좌표 조회 우선 사용, 없으면 장소명 폴백
  url?: string          // 카카오맵 등 외부 링크 (선택)
  cost?: number         // 예상 비용 (선택) — Notion number 타입
  checked: boolean      // 체크박스 — Notion checkbox 타입 (기본값 false)
}
