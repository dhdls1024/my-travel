// 네비게이션 메뉴 아이템 상수
export const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "여행 플래너", href: "/travel" },
] as const

// 기술 스택 정보 상수 (여행 플래너 기반)
export const TECH_STACK = [
  {
    name: "Next.js",
    description: "ISR + 서버 컴포넌트 기반 풀스택 프레임워크",
    version: "16.x",
    href: "https://nextjs.org",
  },
  {
    name: "TypeScript",
    description: "Trip, Place 타입 안전성 보장",
    version: "5.x",
    href: "https://typescriptlang.org",
  },
  {
    name: "Tailwind CSS",
    description: "반응형 모바일/태블릿/데스크톱 레이아웃",
    version: "4.x",
    href: "https://tailwindcss.com",
  },
  {
    name: "shadcn/ui",
    description: "Tabs, Select, Skeleton, Badge 컴포넌트",
    version: "3.x",
    href: "https://ui.shadcn.com",
  },
  {
    name: "Notion API",
    description: "여행 계획 데이터 소스 (ISR revalidate: 60)",
    version: "^5.0.0",
    href: "https://developers.notion.com",
  },
  {
    name: "Kakao Maps",
    description: "카테고리별 색상 마커 + CustomOverlay 팝업",
    version: "JS API",
    href: "https://apis.map.kakao.com",
  },
] as const

// 앱 내부 라우트 상수 — 하드코딩 방지
export const ROUTES = {
  home: "/",
  travel: {
    root: "/travel",
    dashboard: (tripId: string) => `/travel/${tripId}`,
    map: (tripId: string) => `/travel/${tripId}/map`,
  },
  api: {
    revalidate: "/api/revalidate",
  },
} as const

// 카테고리별 마커 색상 상수 — Tailwind 컬러 팔레트 기반
export const MARKER_COLORS = {
  교통: "#3B82F6", // blue-500
  숙소: "#22C55E", // green-500
  맛집: "#F97316", // orange-500
  명소: "#EF4444", // red-500
} as const

// 카테고리 레이블 상수 (객체 — key/value 조회용)
export const CATEGORY_LABELS = {
  전체: "전체",
  교통: "교통",
  숙소: "숙소",
  맛집: "맛집",
  명소: "명소",
} as const

// 카테고리 순서 보장 배열 — 탭/필터 UI 렌더링 순서 고정용
// (객체는 키 순서가 보장되지 않으므로 별도 배열로 관리)
export const CATEGORY_LIST = ["교통", "숙소", "맛집", "명소"] as const

// 여행 상태 순서 보장 배열 — 상태 뱃지/셀렉트 UI 렌더링 순서 고정용
export const TRIP_STATUS_LABELS = ["계획중", "확정", "완료"] as const

// ─── 동해시 투어버스 노선 관련 상수 ───────────────────────────────────────────

// 투어버스 폴리라인 색상 — 관광 노선 강조를 위해 amber 계열 사용
export const TOUR_BUS_LINE_COLOR = "#F59E0B" // amber-500

// 투어버스 폴리라인 두께 (픽셀)
export const TOUR_BUS_LINE_WIDTH = 4

// 투어버스 정류장 마커 크기 (픽셀)
export const TOUR_BUS_STOP_SIZE = 28

// 출발/도착 정류장(0번) 마커 색상 — 일반 정류장과 구분
export const TOUR_BUS_ORIGIN_COLOR = "#EF4444" // red-500

// 일반 정류장 마커 색상
export const TOUR_BUS_STOP_COLOR = "#3B82F6" // blue-500

// 화살표 오버레이 표시 간격 — 폴리라인 구간 중에서 n번째마다 화살표 표시
export const TOUR_BUS_ARROW_INTERVAL = 1

// 동해시 중심 좌표 — 지도 초기 중심 및 로컬 API 위치 바이어스 기준점
export const DONGHAE_CENTER = { lat: 37.5245, lng: 129.114 } as const

// ─── 사이트 메타데이터 상수 ──────────────────────────────────────────────────

// 사이트 메타데이터 상수
export const SITE_CONFIG = {
  name: "나만의 여행 플래너",
  description: "Notion에 흩어진 여행 계획을 하나의 대시보드에서 즉시 조회",
  url: "https://my-travel.vercel.app",
} as const
