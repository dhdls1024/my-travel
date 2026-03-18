// 더미 데이터 — Notion 연동 전까지 UI 개발에 사용
// Phase 3에서 Notion API로 교체 예정
import type { Trip, Place } from "@/types/travel"

// 샘플 여행 ID 상수 — 더미 데이터 내부 참조용
const TRIP_ID_JEJU = "trip-jeju-2026"
const TRIP_ID_OSAKA = "trip-osaka-2026"

// 샘플 여행 2개: 제주도(확정), 오사카(계획중)
export const DUMMY_TRIPS: Trip[] = [
  {
    id: TRIP_ID_JEJU,
    title: "제주도 3박 4일",
    startDate: "2026-04-10",
    endDate: "2026-04-13",
    status: "확정",
    coverImage: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800",
  },
  {
    id: TRIP_ID_OSAKA,
    title: "오사카 4박 5일",
    startDate: "2026-06-20",
    endDate: "2026-06-24",
    status: "계획중",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
  },
]

// 샘플 장소 15개: 제주도 8개 + 오사카 7개
// 카테고리별로 골고루 분포 (교통/숙소/맛집/명소)
// checked: false — 더미 데이터는 미체크 상태로 초기화
export const DUMMY_PLACES: Place[] = [
  // === 제주도 장소 (8개) ===
  {
    id: "place-jeju-01",
    name: "제주공항",
    category: "교통",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-10",
    latitude: 33.5104,
    longitude: 126.4914,
    memo: "김포→제주 10:00 출발",
    checked: false,
  },
  {
    id: "place-jeju-02",
    name: "제주 렌터카",
    category: "교통",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-10",
    latitude: 33.5070,
    longitude: 126.4927,
    memo: "공항 근처 픽업",
    checked: false,
  },
  {
    id: "place-jeju-03",
    name: "해비치 호텔",
    category: "숙소",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-10",
    latitude: 33.2541,
    longitude: 126.8410,
    memo: "오션뷰 디럭스룸",
    url: "https://www.haevichi.com",
    checked: false,
  },
  {
    id: "place-jeju-04",
    name: "성산일출봉",
    category: "명소",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-11",
    latitude: 33.4590,
    longitude: 126.9425,
    memo: "일출 명소, 유네스코 세계자연유산",
    checked: false,
  },
  {
    id: "place-jeju-05",
    name: "우도",
    category: "명소",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-11",
    latitude: 33.5030,
    longitude: 126.9517,
    memo: "배편 성산→우도 30분",
    checked: false,
  },
  {
    id: "place-jeju-06",
    name: "흑돼지 거리",
    category: "맛집",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-11",
    latitude: 33.5100,
    longitude: 126.5199,
    memo: "제주 흑돼지 구이 맛집 골목",
    checked: false,
  },
  {
    id: "place-jeju-07",
    name: "카페 델문도",
    category: "맛집",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-12",
    latitude: 33.2447,
    longitude: 126.2550,
    memo: "중문 해안 오션뷰 카페",
    checked: false,
  },
  {
    id: "place-jeju-08",
    name: "한라산 영실코스",
    category: "명소",
    tripId: TRIP_ID_JEJU,
    visitDate: "2026-04-12",
    latitude: 33.3530,
    longitude: 126.5340,
    memo: "왕복 약 4시간, 윗세오름 대피소까지",
    checked: false,
  },

  // === 오사카 장소 (7개) ===
  {
    id: "place-osaka-01",
    name: "간사이 국제공항",
    category: "교통",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-20",
    latitude: 34.4347,
    longitude: 135.2441,
    memo: "인천→간사이 14:00 도착",
    checked: false,
  },
  {
    id: "place-osaka-02",
    name: "난카이 라피트",
    category: "교통",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-20",
    latitude: 34.4347,
    longitude: 135.2441,
    memo: "공항→난바 특급열차 34분",
    checked: false,
  },
  {
    id: "place-osaka-03",
    name: "호텔 비스타 난바",
    category: "숙소",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-20",
    latitude: 34.6629,
    longitude: 135.5013,
    memo: "난바역 도보 3분",
    url: "https://www.hotel-vista.jp",
    checked: false,
  },
  {
    id: "place-osaka-04",
    name: "도톤보리",
    category: "명소",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-21",
    latitude: 34.6687,
    longitude: 135.5013,
    memo: "글리코 간판, 야경 필수",
    checked: false,
  },
  {
    id: "place-osaka-05",
    name: "이치란 라멘 도톤보리점",
    category: "맛집",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-21",
    latitude: 34.6686,
    longitude: 135.5020,
    memo: "1인 좌석 톤코츠 라멘",
    checked: false,
  },
  {
    id: "place-osaka-06",
    name: "오사카성",
    category: "명소",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-22",
    latitude: 34.6873,
    longitude: 135.5262,
    memo: "천수각 전망대, 공원 산책",
    checked: false,
  },
  {
    id: "place-osaka-07",
    name: "쿠로몬 시장",
    category: "맛집",
    tripId: TRIP_ID_OSAKA,
    visitDate: "2026-06-22",
    latitude: 34.6625,
    longitude: 135.5065,
    memo: "오사카의 부엌, 해산물 먹거리",
    checked: false,
  },
]

// 특정 여행의 장소만 필터링하는 헬퍼 함수
export function getPlacesByTripId(tripId: string): Place[] {
  return DUMMY_PLACES.filter((place) => place.tripId === tripId)
}

// 특정 여행 ID로 Trip 조회하는 헬퍼 함수
export function getTripById(tripId: string): Trip | undefined {
  return DUMMY_TRIPS.find((trip) => trip.id === tripId)
}
