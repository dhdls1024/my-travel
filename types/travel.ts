// 여행 플래너 도메인 타입 정의
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
// 실제 DB 컬럼: Name, Category, Latitude, Longitude, Memo, URL, VisitDate, trips
export interface Place {
  id: string
  name: string
  category: PlaceCategory
  tripId: string        // Trip Relation ID (trips 컬럼)
  visitDate?: string    // 방문일 (선택)
  latitude?: number     // 위도 — 카카오 지도 마커 표시에 사용
  longitude?: number    // 경도 — 카카오 지도 마커 표시에 사용
  memo?: string         // 메모 (선택)
  url?: string          // 카카오맵 등 외부 링크 (선택)
}
