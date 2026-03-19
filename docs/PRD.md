# 나만의 여행 플래너 MVP PRD

> Personal Travel Planner & Guide
> 작성일: 2026-03-16

---

## 핵심 정보

**목적**: Notion에 흩어진 여행 계획(교통/숙소/맛집/명소)을 하나의 대시보드에서 즉시 조회할 수 있게 시각화한다
**사용자**: Notion으로 여행 계획을 관리하는 솔로 개발자 겸 여행자 (1인 개인 프로젝트)

---

## 사용자 여정

```
1. 홈 페이지
   ↓ 헤더 "여행 플래너" 메뉴 클릭 또는 직접 접속

2. 여행 목록 페이지
   ↓ Notion의 Trips DB에서 ISR로 불러온 여행 카드 목록 표시
   ↓ 여행 카드 클릭

3. 여행 대시보드 페이지
   ↓ 선택한 여행의 D-Day, 카테고리 요약, 장소 카드 목록 표시
   ↓ 카테고리 탭 전환 또는 날짜 필터 선택

   [리스트 뷰] → 장소 카드 목록 확인 → (카드 클릭) → 장소 상세 모달
   [지도 뷰] → 지도 페이지로 이동 또는 사이드바 지도 표시

4. 지도 페이지 (선택적 진입)
   ↓ 장소 마커 클릭 → 마커 팝업 표시
   ↓ 날짜 필터로 당일 장소만 표시

5. 완료 → 여행 목록 페이지로 돌아가기 또는 다른 여행 카드 선택
```

---

## 기능 명세

### 1. MVP 핵심 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F001** | 여행 목록 표시 | Notion Trips DB를 ISR로 읽어 여행 카드 목록 렌더링, D-Day 및 기간 표시 | 진입점이자 여행 단위 선택의 핵심 | 여행 목록 페이지 |
| **F002** | 여행 대시보드 | 선택한 여행의 카테고리 요약 카운트(교통/숙소/맛집/명소)와 D-Day 표시 | 여행 전반 상황을 한눈에 파악하는 핵심 뷰 | 여행 대시보드 페이지 |
| **F003** | 카테고리 탭 필터링 | 교통/숙소/맛집/명소 탭으로 장소 카드를 즉시 필터링 | 현장에서 필요한 정보를 빠르게 찾는 핵심 UX | 여행 대시보드 페이지 |
| **F004** | 날짜 필터링 | 특정 날짜의 일정만 카드 목록에 표시 | 여행 당일 해당 날짜 일정만 조회하는 실용적 기능 | 여행 대시보드 페이지 |
| **F005** | 장소 카드 표시 | 카테고리별 맞춤 정보(운영시간/예약번호/추천메뉴/평점 등) 카드 레이아웃 | Notion 데이터를 읽기 편한 형태로 시각화하는 핵심 | 여행 대시보드 페이지 |
| **F006** | 지도 마커 시각화 | Notion에 저장된 위도/경도로 지도에 카테고리별 색상 마커 표시 | 이동 동선 파악 및 현장 위치 확인 핵심 기능 | 지도 페이지 |
| **F007** | 마커 팝업 | 지도 마커 클릭 시 장소명/카테고리/메모 팝업 표시 | 지도에서 장소 정보를 즉시 확인하는 기능 | 지도 페이지 |

### 2. MVP 필수 지원 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F010** | Notion ISR 동기화 | Notion API에서 데이터를 서버 사이드 ISR(revalidate: 60)로 캐싱, 수동 새로고침 버튼 제공 | Notion 수정 시 별도 배포 없이 웹에 반영되는 핵심 워크플로우 | 여행 목록 페이지, 여행 대시보드 페이지 |
| **F011** | 반응형 모바일 레이아웃 | 모바일 1열 그리드 + 리스트/지도 토글, 태블릿 2열, 데스크톱 3열+사이드바 지도 | 현장에서 스마트폰으로 편리하게 조회하기 위한 필수 조건 | 여행 대시보드 페이지, 지도 페이지 |

### 3. MVP 이후 기능 (제외)

- 텍스트 검색 (장소명, 메모 내용 검색)
- 비용 집계 및 시각화 (카테고리/날짜별 예상 비용 합산)
- 일정 타임라인 뷰 (간트 차트 형태)
- Geocoding 자동화 (주소 → 위도/경도 자동 변환)
- 공유 기능 (공개 URL)

### 4. Phase 5 확장 기능

| ID | 기능명 | 설명 | 확장 이유 | 관련 페이지 |
|----|--------|------|----------|------------|
| **F020** | GPS 현재 위치 표시 | `navigator.geolocation.getCurrentPosition()` Web API로 사용자 실시간 위치를 지도에 파란 원형 펄싱 마커로 표시, 최초 1회 + "위치 갱신" 버튼으로 업데이트 | 현장에서 가장 가까운 다음 목적지 파악에 직접적으로 유용 — MVP 완료 후 여행 현장 편의성 향상 목적 | 지도 페이지 |
| **F021** | PWA (Progressive Web App) | `next-pwa` 또는 Next.js 15+ 내장 PWA 지원으로 홈 화면 앱 추가, Cache-first 정적 자산 + Network-first Notion 데이터 캐싱, 오프라인 폴백 배너 표시 | 지하·외곽 등 네트워크 불안정 여행지에서 마지막 로딩된 여행 계획 확인 가능 — 오프라인 신뢰성 확보 | 전체 페이지 |

#### F020: GPS 현재 위치 표시 상세

| 항목 | 내용 |
|------|------|
| **API** | `navigator.geolocation.getCurrentPosition()` — 브라우저 내장 Web API, 추가 패키지 없음 |
| **마커 스타일** | 기존 장소 마커(카테고리별 색상 CustomOverlay)와 구분되는 파란 원형 펄싱 마커 — Tailwind `animate-ping` 클래스 활용 (`@keyframes` 인라인 style 방식 불가, CustomOverlay content에 Tailwind 클래스 주입으로 대체) |
| **업데이트 방식** | 최초 페이지 진입 시 1회 위치 조회 + 지도 우하단 "위치 갱신" 버튼으로 수동 재조회 |
| **권한 거부 처리** | 최초 진입 시 조용히 무시. 버튼 클릭 시 권한 거부는 버튼 상태(disabled, 아이콘 변경)로 피드백 — 에러 토스트 없음, 여행 장소 마커 정상 표시 유지 |
| **구현 위치** | `lib/use-geolocation.ts` 커스텀 훅 (Geolocation 상태 관리) + `components/map/CurrentLocationMarker.tsx` (마커 렌더링) — 30줄 규칙에 따라 훅/컴포넌트 분리 |

#### F021: PWA 상세

| 항목 | 내용 |
|------|------|
| **구현 방식** | Next.js 내장 PWA 지원 (`app/manifest.ts` + `public/sw.js` 수동 작성) — `next-pwa` 패키지는 Turbopack과 비호환으로 사용 불가 |
| **manifest** | `app/manifest.ts` 파일로 생성 (Next.js 16 내장 방식): `name`, `short_name`, `icons` (192x192, 512x512), `theme_color`, `display: "standalone"` |
| **Service Worker 캐싱 전략** | 정적 자산(JS/CSS/이미지): Cache-first / 페이지 HTML: Network-first (ISR 갱신 반영) / `/api/*` 경로: NetworkOnly (On-demand ISR 새로고침 버튼 정상 동작 보장) |
| **오프라인 폴백** | 여행 목록·대시보드 페이지: 캐시된 HTML 표시 + "오프라인 상태입니다" 배너. 지도 페이지: 카카오 API 타일 캐싱 불가(이용 약관)이므로 "지도를 불러올 수 없습니다 (인터넷 연결 확인)" 메시지 표시 |
| **iOS Safari 지원** | `<meta name="apple-mobile-web-app-capable" content="yes">` + `apple-touch-icon` 메타태그 (`app/layout.tsx` 추가) |
| **구현 위치** | `app/manifest.ts` (Manifest), `public/sw.js` (Service Worker), `public/icons/` (아이콘), `app/layout.tsx` (메타태그), `app/offline/page.tsx` (오프라인 폴백 페이지) |

---

## 메뉴 구조

```
나만의 여행 플래너 내비게이션
├── 홈
│   └── 기존 홈페이지 (HeroSection + TechStackSection)
└── 여행 플래너
    └── 기능: F001 (여행 목록 표시)

여행 대시보드 내부 내비게이션
├── 여행 목록으로 돌아가기
│   └── 기능: F001 (여행 목록 표시)
├── 카테고리 탭
│   ├── 전체 - F003
│   ├── 교통 - F003
│   ├── 숙소 - F003
│   ├── 맛집 - F003
│   └── 명소 - F003
├── 날짜 필터
│   └── 기능: F004 (날짜별 필터링)
├── 새로고침 버튼
│   └── 기능: F010 (Notion ISR 수동 동기화)
└── 지도 보기 버튼 (모바일) / 사이드바 지도 (데스크톱)
    └── 기능: F006, F007 (지도 마커 시각화 + 팝업)
```

---

## 페이지별 상세 기능

### 여행 목록 페이지

> **구현 기능:** `F001`, `F010` | **메뉴 위치:** 헤더 "여행 플래너" 메뉴

| 항목 | 내용 |
|------|------|
| **역할** | 등록된 여행 목록을 카드 그리드로 표시하는 진입 페이지 |
| **진입 경로** | 헤더 "여행 플래너" 메뉴 클릭, 또는 `/travel` 직접 접속 |
| **사용자 행동** | 여행 카드 목록을 훑어보고 원하는 여행을 클릭해 대시보드로 이동 |
| **주요 기능** | • Notion Trips DB ISR 데이터 기반 여행 카드 렌더링<br>• 카드에 여행 제목, 기간, D-Day, 총 장소 수 표시<br>• 카드 그리드 레이아웃 (모바일 1열 / 태블릿 2열 / 데스크톱 3열)<br>• Skeleton 로딩 상태 처리<br>• **여행 카드 클릭** 시 여행 대시보드 페이지로 이동 |
| **다음 이동** | 카드 클릭 → 여행 대시보드 페이지 |

---

### 여행 대시보드 페이지

> **구현 기능:** `F002`, `F003`, `F004`, `F005`, `F010`, `F011` | **메뉴 위치:** 여행 목록 페이지에서 카드 클릭

| 항목 | 내용 |
|------|------|
| **역할** | 선택한 여행의 모든 정보를 카테고리/날짜 필터와 함께 통합 표시하는 핵심 페이지 |
| **진입 경로** | 여행 목록 페이지에서 여행 카드 클릭 |
| **사용자 행동** | 카테고리 탭을 전환하거나 날짜를 선택해 필요한 장소 카드를 조회, 지도 뷰로 전환해 동선 확인 |
| **주요 기능** | • 상단 여행 요약: 제목, D-Day, 기간, 카테고리별 장소 수 배지<br>• 카테고리 탭(전체/교통/숙소/맛집/명소)으로 장소 카드 즉시 필터링<br>• 날짜 드롭다운으로 특정 날짜 일정만 표시<br>• 카테고리별 맞춤 장소 카드 (교통: 출발/도착시간·예약번호 / 숙소: 체크인아웃·연락처 / 맛집: 영업시간·추천메뉴·평점 / 명소: 운영시간·입장료·소요시간)<br>• 데스크톱: 좌측 카드 목록 + 우측 사이드바 지도<br>• 모바일: 하단 리스트/지도 토글 버튼<br>• **새로고침** 버튼으로 Notion 데이터 수동 동기화<br>• Skeleton 로딩 + sonner 토스트 에러 알림 |
| **다음 이동** | 지도 보기 클릭(모바일) → 지도 페이지, 뒤로가기 → 여행 목록 페이지 |

---

### 지도 페이지

> **구현 기능:** `F006`, `F007`, `F004`, `F011` | **인증:** 없음 (공개 접근)

| 항목 | 내용 |
|------|------|
| **역할** | 선택한 여행의 장소들을 지도 위 마커로 시각화해 이동 동선을 파악하는 페이지 |
| **진입 경로** | 여행 대시보드 페이지의 "지도 보기" 버튼 클릭 (모바일) / 대시보드 사이드바에서 표시 (데스크톱) |
| **사용자 행동** | 지도에서 마커를 클릭해 장소 정보를 확인하고, 날짜 필터로 당일 일정만 표시해 동선 파악 |
| **주요 기능** | • 전체 화면 지도 (`next/dynamic` + `ssr: false`로 SSR 비활성화, 브라우저 DOM 의존성 처리)<br>• 카테고리별 색상 구분 마커 (교통: `#3B82F6` 파랑 / 숙소: `#22C55E` 초록 / 맛집: `#F97316` 주황 / 명소: `#EF4444` 빨강)<br>• 마커 구현: `kakao.maps.CustomOverlay` 또는 `kakao.maps.MarkerImage` — CustomOverlay는 HTML/CSS 자유도가 높고, MarkerImage는 이미지 파일 기반 (MVP에서는 CustomOverlay 권장)<br>• 마커 클릭 팝업: `kakao.maps.CustomOverlay` 사용 — InfoWindow 대비 커스텀 스타일 자유도 높아 카테고리별 색상 팝업 구현에 적합<br>• 팝업 내용: 장소명·카테고리·간단 메모 표시<br>• 날짜 필터로 특정 날짜 장소만 마커 표시<br>• 반응형 지도 컨테이너 — 모바일: `h-[calc(100vh-64px)]` / 데스크톱 사이드바: `h-full`<br>• **뒤로가기** 버튼으로 대시보드 복귀 |
| **다음 이동** | 뒤로가기 → 여행 대시보드 페이지 |

---

## 데이터 모델

### Trips (여행)

| 필드 | 설명 | TypeScript 타입 | Notion 프로퍼티 타입 |
|------|------|----------------|-------------------|
| id | Notion 페이지 ID | string | (자동 생성 Page ID) |
| title | 여행 제목 (예: "2026 도쿄 여행") | string | **Title** |
| startDate | 여행 시작 날짜 | Date | **Date** (start) |
| endDate | 여행 종료 날짜 | Date | **Date** (end) |
| status | 계획중 / 확정 / 완료 | string | **Select** |
| coverImage | 대표 이미지 URL | string | **URL** |

### Places (장소)

| 필드 | 설명 | TypeScript 타입 | Notion 프로퍼티 타입 |
|------|------|----------------|-------------------|
| id | Notion 페이지 ID | string | (자동 생성 Page ID) |
| name | 장소명 | string | **Title** |
| category | 교통 / 숙소 / 맛집 / 명소 | string | **Select** |
| tripId | 연결된 여행 ID | string | **Relation → Trips DB** |
| visitDate | 방문 예정 날짜 | Date | **Date** |
| address | 상세 주소 | string | **Rich Text** |
| latitude | 지도 마커용 위도 (-90~90) | number | **Number** |
| longitude | 지도 마커용 경도 (-180~180) | number | **Number** |
| time | 운영시간 또는 예약 시간 (HH:mm 형식) | string | **Rich Text** |
| reservationNumber | 교통/숙소 예약 번호 (선택, 교통/숙소만 사용) | string | **Rich Text** |
| memo | 추천 메뉴, 팁 등 자유 메모 | string | **Rich Text** |
| rating | 평점 (1~5 범위) | number | **Number** |

> **관계 방향 설계**: Places DB에서 Trips DB를 향하는 단방향 Relation으로 설계한다.
> Notion API는 역방향 관계 조회(Trips → Places 자동 수집)를 지원하지 않으므로,
> 특정 여행의 장소 목록은 Places DB를 **filter로 직접 쿼리**하는 방식으로 처리한다.

---

## Notion DB 구성 가이드

### Trips DB 컬럼 설정

Notion에서 Trips 데이터베이스를 생성할 때 아래 컬럼명과 타입을 정확히 따른다.

| Notion 컬럼명 | Notion 타입 | 설정 상세 |
|-------------|------------|---------|
| `Name` | Title | (기본 제목 컬럼, 변경 불필요) |
| `StartDate` | Date | 날짜 형식: `YYYY/MM/DD` |
| `EndDate` | Date | 날짜 형식: `YYYY/MM/DD` |
| `Status` | Select | 선택지: `계획중`, `확정`, `완료` |
| `CoverImage` | URL | 대표 이미지 직접 링크 |

### Places DB 컬럼 설정

| Notion 컬럼명 | Notion 타입 | 설정 상세 |
|-------------|------------|---------|
| `Name` | Title | (기본 제목 컬럼, 장소명) |
| `Category` | Select | 선택지: `교통`, `숙소`, `맛집`, `명소` |
| `Trip` | **Relation** | → Trips DB 연결, "Limit to one page" 체크 |
| `VisitDate` | Date | 날짜 형식: `YYYY/MM/DD` |
| `Address` | Rich Text | 상세 주소 |
| `Latitude` | Number | 소수점 6자리 (예: 37.566826) |
| `Longitude` | Number | 소수점 6자리 (예: 126.977986) |
| `Time` | Rich Text | `HH:mm` 형식 (예: `09:00~18:00`) |
| `ReservationNumber` | Rich Text | 예약 번호 (교통/숙소만 입력) |
| `Memo` | Rich Text | 추천 메뉴, 팁 등 자유 메모 |
| `Rating` | Number | 1~5 정수 (맛집/명소만 입력) |

> **Relation 설정 방법**: Places DB에서 `+ 속성 추가` → `관계형` 선택 → Trips DB 선택 → "페이지 1개로 제한" 활성화

### Notion API 쿼리 패턴

특정 여행 ID에 속하는 장소 목록은 Places DB에서 Relation 필터로 직접 조회한다.

```typescript
// lib/notion.ts
// 특정 여행 ID에 연결된 장소 목록을 Relation 필터로 조회
// tripId: Notion Trips DB 페이지 ID (UUID 형식)
const fetchPlacesByTripId = async (tripId: string) => {
  const places: PageObjectResponse[] = []
  let cursor: string | undefined = undefined

  // has_more가 false가 될 때까지 커서 기반 페이지네이션 반복
  // Notion API는 1회 요청당 최대 100개 반환, Relations 필드 25개 제한 존재
  do {
    const response = await notion.databases.query({
      database_id: NOTION_PLACES_DB_ID,
      filter: {
        property: "Trip",      // Places DB의 Relation 컬럼명
        relation: {
          contains: tripId,    // 연결된 Trips 페이지 ID로 필터링
        },
      },
      sorts: [
        { property: "VisitDate", direction: "ascending" },
      ],
      page_size: 100,          // 1회 최대 100개 요청
      start_cursor: cursor,    // 다음 페이지 커서 (첫 요청은 undefined)
    })

    places.push(...(response.results as PageObjectResponse[]))
    cursor = response.next_cursor ?? undefined
  } while (cursor !== undefined) // has_more가 false → next_cursor가 null

  return places
}
```

### Relations 25개 제한 및 페이지네이션 전략

Notion Relation 프로퍼티는 **1개 페이지당 최대 25개 관계**만 응답에 포함된다.
장소 수가 25개를 초과할 경우 아래 전략을 따른다.

| 상황 | 전략 |
|------|------|
| 장소 ≤ 25개 | 단순 query 1회로 처리 |
| 장소 > 25개 | `has_more: true` + `start_cursor` 커서 페이지네이션으로 전체 수집 |
| 단일 여행 장소가 매우 많을 경우 | Places DB를 직접 쿼리(위 패턴)하므로 Relation 25개 제한 비해당 |

> **설계 결정**: Places → Trips 방향 단방향 Relation + Places DB 직접 필터 쿼리 방식을 채택했기 때문에,
> Trips 페이지에서 Relation rollup으로 장소 목록을 읽는 방식을 사용하지 않는다.
> 이로써 25개 제한을 근본적으로 우회한다.

---

## 기술 스택 (기존 프로젝트 기반)

### 프론트엔드 프레임워크 (기존 유지)

- **Next.js 16** (App Router) - ISR 및 서버 컴포넌트 활용
- **TypeScript 5** - 타입 안전성 (types/travel.ts 추가)
- **React 19** - UI 라이브러리

### 스타일링 & UI (기존 유지)

- **TailwindCSS v4** (PostCSS 플러그인 방식, `@import "tailwindcss"`) - 유틸리티 CSS
- **shadcn/ui** - 카드, 탭, 드롭다운, 스켈레톤 컴포넌트
- **Lucide React** - 아이콘

### 폼 & 알림 (기존 유지)

- **sonner** - Notion API 에러 토스트 알림
- **date-fns** (신규 추가) - D-Day 계산, 날짜 포매팅
- **date-fns-tz** (신규 추가) - Notion UTC ↔ 한국(UTC+9) 시간대 변환

### 데이터 페칭 (기존 유지 + 확장)

- **서버 컴포넌트 fetch() + ISR** - Notion 데이터 캐싱 (revalidate: 60)
- **@tanstack/react-query** - 클라이언트 사이드 필터링 상태 관리
- **@notionhq/client ^5.0.0** (신규 추가) - Notion API 공식 클라이언트

### 지도

- **Kakao Map API** - 국내 여행 중심, 한국 POI 데이터 우수
- **구현 방식 (우선순위 순)**:
  1. **공식 Kakao Maps JS API** (`kakao.maps`) + `next/script` 로딩 — 공식 문서 완비, 안정적 (1순위)
  2. **`react-kakao-maps-sdk`** (⚠️ 조건부) — React 래퍼 라이브러리, 단 npm/GitHub 문서 접근 불가 이력 있어 유지 상태 불명확. **Week 2 Day 1 POC 필수, 실패 시 공식 API로 전환**
- 지도 컴포넌트는 `next/dynamic`으로 SSR 비활성화 (`ssr: false`) — 카카오 지도는 브라우저 DOM에 의존하므로 서버 사이드 렌더링 불가, `"use client"` 필수
- `next/script strategy="afterInteractive"` — 페이지 인터랙티브 이후 SDK 로드하여 초기 번들 최적화, `kakao.maps.load()` 콜백 내에서 지도 초기화 필수
- TypeScript 환경에서 `window.kakao` 타입 선언 필요 (`declare global { interface Window { kakao: any } }` 또는 `@types/kakao.maps.d.ts` 커뮤니티 타입)
- 지도 컨테이너 div에 고정 높이 필수 (예: `h-[calc(100vh-64px)]`) — 높이 0이면 지도 렌더링 불가

### 다크모드 (기존 유지)

- **next-themes** - CSS 변수 기반 (`attribute="class"`)

### 배포 & 호스팅

- **Vercel** - Next.js ISR on-demand revalidation 지원

### 패키지 관리

- **npm** - 의존성 관리

---

## 디렉토리 구조 (추가분)

```
app/
  travel/
    page.tsx                  # 여행 목록 페이지 (F001, F010)
    [tripId]/
      page.tsx                # 여행 대시보드 페이지 (F002~F005, F010, F011)
      map/
        page.tsx              # 지도 페이지 (F004, F006, F007, F011)
  api/
    revalidate/
      route.ts                # On-demand ISR revalidation (F010)

lib/
  notion.ts                   # Notion API 클라이언트 및 데이터 페치 헬퍼
  map-utils.ts                # 카테고리별 마커 색상 상수 (MARKER_COLORS), Place → kakao.maps.LatLng 변환 유틸, window.kakao 타입 선언

components/
  travel/
    TripCard.tsx              # 여행 요약 카드 (F001)
    TripSummary.tsx           # D-Day + 카테고리 카운트 배지 (F002)
    CategoryTabs.tsx          # 카테고리 탭 필터 (F003)
    DateFilter.tsx            # 날짜 드롭다운 필터 (F004)
    PlaceCard.tsx             # 카테고리별 맞춤 장소 카드 (F005)
  map/
    MapView.tsx               # 지도 루트 컴포넌트 — next/dynamic ssr:false로 래핑, kakao.maps.Map 초기화 (F006)
    PlaceMarker.tsx           # 카테고리별 색상 CustomOverlay 마커 생성 및 지도 표시 (F006)
    MarkerPopup.tsx           # 마커 클릭 시 CustomOverlay 팝업 — 장소명·카테고리·메모 표시 (F007)

types/
  travel.ts                   # Trip, Place, Category 타입 정의
```

## 시간대 처리 전략

Notion Date 필드(UTC)와 클라이언트(한국 UTC+9) 간 시간대 불일치를 방지하기 위해 `date-fns-tz`로 명시적 변환 처리한다.

| 방향 | 처리 |
|------|------|
| Notion → 클라이언트 | `utcToZonedTime(date, 'Asia/Seoul')` — UTC를 한국 시간으로 변환 후 표시 |
| 클라이언트 → Notion 필터 | `zonedTimeToUtc(date, 'Asia/Seoul')` — 선택한 날짜를 UTC로 변환 후 쿼리 |
| D-Day 계산 | 한국 시간 기준으로 오늘 날짜와 비교 |

> **주의**: 날짜 필터링(F004) 시 시간대 미처리 시 하루 오차 발생 가능

---

## 에러 처리 및 재시도 전략

### Notion API 에러 대응

| 에러 유형 | 대응 | 재시도 |
|----------|------|--------|
| 429 Rate Limit (3 RPS 초과) | exponential backoff (1s → 2s → 4s) | 최대 3회 |
| 500/502/503 서버 에러 | exponential backoff (0.5s → 1s) | 최대 2회 |
| 401 인증 에러 | 즉시 실패, 에러 로그 | 재시도 안함 |
| 네트워크 타임아웃 | ISR 캐시 데이터 표시 + 토스트 알림 | 최대 2회 |

### 사용자 피드백

- **ISR 캐시 히트**: 정상 표시 (사용자 인지 불필요)
- **API 실패 + 캐시 있음**: 캐시 데이터 표시 + sonner 경고 토스트 ("최신 데이터를 불러오지 못했습니다")
- **API 실패 + 캐시 없음**: 에러 화면 (Error Boundary) + 재시도 버튼
- **새로고침 성공**: sonner 성공 토스트 ("여행 정보가 업데이트되었습니다")
- **새로고침 실패**: sonner 에러 토스트 ("새로고침 실패. 잠시 후 다시 시도해주세요")

### 구현 위치

- `lib/notion.ts` — `fetchWithRetry()` 래퍼 함수로 모든 Notion API 호출 감싸기
- 서버 컴포넌트 — try/catch + ISR 캐시 폴백
- 클라이언트 새로고침 — sonner 토스트로 결과 알림

---

## 개발 일정 (2~3주)

### Week 1: Notion 연동 + 핵심 UI (F001~F005, F010)

| 일차 | 작업 | 산출물 |
|------|------|--------|
| Day 1 | 환경 설정 + Notion DB 생성 + 샘플 데이터 입력 | Notion DB 완성, 환경변수 설정 |
| Day 2 | `lib/notion.ts` (API 클라이언트, fetchWithRetry, 타입 매핑) + `types/travel.ts` | Notion 데이터 페칭 완성 |
| Day 3 | `/travel` 여행 목록 페이지 (TripCard, ISR, Skeleton) | F001 완성 |
| Day 4~5 | `/travel/[tripId]` 대시보드 (TripSummary, CategoryTabs, DateFilter, PlaceCard) | F002~F005 완성 |

### Week 2: 지도 + 반응형 + 마무리 (F006~F007, F011)

| 일차 | 작업 | 산출물 |
|------|------|--------|
| Day 1 | Kakao Maps POC + MapView 컴포넌트 (dynamic import) | 지도 기본 동작 검증 |
| Day 2~3 | 지도 페이지 (PlaceMarker, MarkerPopup, 날짜 필터 연동) | F006~F007 완성 |
| Day 4 | 반응형 레이아웃 (모바일 1열 + 리스트/지도 토글, 데스크톱 사이드바 지도) | F011 완성 |
| Day 5 | On-demand ISR 엔드포인트 + 새로고침 버튼 + 에러 처리 | F010 완성 |

### Week 3 (선택): 최적화 + 배포

| 일차 | 작업 | 산출물 |
|------|------|--------|
| Day 1~2 | 다크모드 전체 적용 + 번들/이미지 최적화 | 성능 개선 |
| Day 3 | 에러 케이스 테스트 + 시간대 엣지 케이스 검증 | 안정성 확보 |
| Day 4~5 | Vercel 배포 + 모니터링 설정 | 프로덕션 배포 |

> **일정 단축 포인트**: Phase 0(사전 준비)를 Week 1 Day 1에 통합, 지도 POC를 Week 2 Day 1에 통합하여 별도 준비 기간 제거

---

## 환경변수

```env
# Notion
NOTION_API_KEY=secret_xxxxx
NOTION_TRIPS_DB_ID=xxxxx
NOTION_PLACES_DB_ID=xxxxx

# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=xxxxx
```

---

## 신규 패키지 설치

**Notion + 날짜 유틸 (필수)**

```bash
npm install @notionhq/client@^5.0.0 date-fns date-fns-tz
```

**Kakao Maps (방식 선택)**

```bash
# 방식 A: react-kakao-maps-sdk (POC 후 결정 — 유지 상태 검증 필요)
npm install react-kakao-maps-sdk

# 방식 B: 공식 JS API 사용 시 TypeScript 타입만 설치 (권장)
npm install --save-dev @types/kakao.maps.d.ts
```

> **선택 기준**: Week 2 Day 1 POC에서 `react-kakao-maps-sdk` 설치 및 기본 지도 렌더링 검증 후 결정.
> POC 실패(설치 오류, 문서 부재, App Router 호환 문제) 시 방식 B(공식 JS API)로 전환한다.

---

## Kakao Maps 구현 가이드

### SDK 로딩 방식 비교

| 항목 | `react-kakao-maps-sdk` | 공식 JS API (`kakao.maps`) |
|------|----------------------|--------------------------|
| 설치 | `npm install react-kakao-maps-sdk` | 별도 설치 없음 (Script 태그 로드) |
| React 통합 | 컴포넌트/훅 제공 | 직접 `useEffect`로 제어 |
| TypeScript | 내장 타입 | `@types/kakao.maps.d.ts` 별도 설치 |
| 문서 접근성 | ⚠️ npm/GitHub 403·404 이력 | 공식 문서 안정적 (apis.map.kakao.com) |
| App Router 호환 | POC 검증 필요 | `"use client"` + `next/dynamic ssr:false` 패턴으로 검증됨 |
| 커스텀 오버레이 | SDK 추상화 수준에 따라 제약 있을 수 있음 | 직접 `kakao.maps.CustomOverlay` API 사용 |
| **MVP 권장** | POC 통과 시 선택 가능 | **1순위 권장** |

### Next.js App Router + 공식 JS API 기본 패턴

```tsx
// components/map/MapView.tsx
// "use client" 필수 — kakao.maps는 브라우저 전용 API
"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

// window.kakao 타입 선언 — 공식 타입 미제공 시 전역 보강
declare global {
  interface Window {
    kakao: any
  }
}

interface MapViewProps {
  lat: number
  lng: number
  level?: number
}

// 지도 컨테이너와 Script 로딩을 함께 관리하는 컴포넌트
export default function MapView({ lat, lng, level = 3 }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // kakao.maps.load() 콜백 — SDK 준비 완료 시점에 지도 초기화
  const initMap = () => {
    if (!mapContainerRef.current) return

    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level,
    }
    new window.kakao.maps.Map(mapContainerRef.current, options)
  }

  return (
    <>
      {/* strategy="afterInteractive" — 페이지 인터랙티브 이후 SDK 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => window.kakao.maps.load(initMap)}
      />
      {/* 지도 컨테이너 — 고정 높이 필수, 없으면 지도 렌더링 불가 */}
      <div ref={mapContainerRef} className="h-[calc(100vh-64px)] w-full" />
    </>
  )
}
```

```tsx
// app/travel/[tripId]/map/page.tsx
// next/dynamic으로 SSR 비활성화 — 카카오 지도는 서버에서 실행 불가
import dynamic from "next/dynamic"

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-64px)] w-full animate-pulse bg-muted" />
  ),
})

export default function MapPage() {
  return <MapView lat={37.566826} lng={126.977986} />
}
```

### 환경변수 설정

```env
# .env.local
# NEXT_PUBLIC_ 접두사 필수 — 클라이언트 브라우저에서 Script src URL에 직접 노출됨
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=여기에_앱키_입력
```

### Kakao Developers 앱 등록 절차

1. [Kakao Developers](https://developers.kakao.com) 접속 → 내 애플리케이션 → 애플리케이션 추가
2. 앱 이름 입력 후 생성 → **앱 키** 탭에서 **JavaScript 키** 복사 → `.env.local`에 설정
3. **플랫폼** 탭 → **Web** 플랫폼 등록 → 사이트 도메인 입력
   - 개발: `http://localhost:3000`
   - 프로덕션: Vercel 배포 URL (예: `https://my-travel.vercel.app`)
4. 도메인 미등록 시 지도 API 호출 차단됨 (콘솔 에러 발생)

### 마커 색상 상수 (`lib/map-utils.ts` 정의)

```ts
// lib/map-utils.ts
// 카테고리별 마커 색상 — Tailwind 컬러 팔레트 기반
export const MARKER_COLORS = {
  교통: "#3B82F6", // blue-500
  숙소: "#22C55E", // green-500
  맛집: "#F97316", // orange-500
  명소: "#EF4444", // red-500
} as const
```

### InfoWindow vs CustomOverlay 선택 기준

| 항목 | `kakao.maps.InfoWindow` | `kakao.maps.CustomOverlay` |
|------|------------------------|--------------------------|
| 스타일 | 기본 말풍선 스타일 고정 | HTML/CSS 완전 자유 |
| 구현 난이도 | 낮음 | 중간 |
| 카테고리별 색상 팝업 | 제한적 | 적합 |
| **MVP 권장** | — | **권장** (카테고리 색상 팝업 구현 용이) |
