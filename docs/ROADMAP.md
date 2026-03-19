# 나만의 여행 플래너 개발 로드맵

Notion에 흩어진 여행 계획을 하나의 대시보드에서 즉시 조회할 수 있게 시각화하는 개인용 여행 플래너 MVP

> **PRD 검증 상태**: ✅ 적극 통과 - 구현 권장 (2026-03-17 재검증 완료)
> Critical Issues 3/3 해결, Major Issues 85% 해결

---

## 개요

나만의 여행 플래너는 Notion으로 여행 계획을 관리하는 솔로 개발자 겸 여행자를 위한 개인 프로젝트로, 다음 핵심 기능을 제공합니다:

- **여행 목록 대시보드**: Notion Trips DB를 ISR로 읽어 여행 카드 그리드로 렌더링, D-Day 및 기간 표시
- **여행 대시보드**: 카테고리 탭(교통/숙소/맛집/명소) 및 날짜 드롭다운 필터로 장소 카드 즉시 조회
- **지도 시각화**: Kakao Maps 공식 JS API 기반 카테고리별 색상 마커 표시, 마커 클릭 CustomOverlay 팝업으로 이동 동선 파악
- **Notion ISR 동기화**: revalidate: 60 자동 갱신 + 새로고침 버튼 on-demand revalidation

---

## 개발 워크플로우

1. **작업 계획**

   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조

3. **작업 구현**

   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

   - 로드맵에서 완료된 작업을 완료 표시로 업데이트

---

## 개발 단계

### Phase 0: 사전 준비 체크리스트

> PRD 재검증(2026-03-17)으로 설계가 확정된 사항들입니다. 개발 착수 전 아래 항목을 완료해야 합니다.

**PRD 수정으로 이미 해결된 설계 사항**

- ✅ Notion DB 설계 확정 — Relation 타입 명시 + DB 구성 가이드 추가 (Places.Trip → Trips DB, 단방향 Relation)
- ✅ 시간대 처리 전략 정의 — `date-fns-tz` UTC ↔ `Asia/Seoul` 양방향 변환 방식 명시
- ✅ Kakao Maps 구현 방식 확정 — 공식 JS API 1순위, `next/script strategy="afterInteractive"` + `kakao.maps.load()` 콜백 패턴 확정
- ✅ 에러 처리 전략 문서화 — `fetchWithRetry()` exponential backoff 설계 완료
- ✅ @notionhq/client 버전 명시 — `^5.0.0`
- ✅ Notion Relations 25개 제한 대응 — `do-while` + `start_cursor` 커서 페이지네이션 전략 확정

**개발 착수 전 남은 작업**

- ✅ Notion DB 실제 생성 (Trips + Places DB, 샘플 데이터 입력) — 2026-03-17 완료
  - Trips DB: `Name`, `StartDate`, `EndDate`, `Status`(계획중/확정/완료), `CoverImage` 컬럼
  - Places DB: `Name`, `Category`(교통/숙소/맛집/명소), `trips`(Relation → Trips DB), `VisitDate`, `Memo`, `URL`, `Cost`(number), `CheckBox`(checkbox) 컬럼 (실제 CSV 기반 확정)
  - 위경도는 DB에 저장하지 않음 — 카카오 로컬 API로 런타임 자동 보완
- ✅ 환경변수 발급 및 설정 — `NOTION_API_KEY`, `NOTION_TRIPS_DB_ID`, `NOTION_PLACES_DB_ID`, `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` — 2026-03-17 완료
- ✅ Kakao Developers 앱 등록 — 웹 플랫폼에 `http://localhost:3000` 도메인 등록 — 2026-03-17 완료
- ✅ 신규 패키지 설치 — 2026-03-17 완료
  ```bash
  npm install @notionhq/client@^5.0.0 date-fns date-fns-tz
  npm install --save-dev @types/kakao.maps.d.ts
  ```

---

### Phase 1: 애플리케이션 골격 구축

> 전체 라우트 구조와 빈 페이지 골격, 타입 정의를 먼저 완성하여 이후 UI 작업과 기능 구현이 독립적으로 진행될 수 있도록 기반을 마련합니다.

- ✅ **Task 001: 환경 설정 및 신규 패키지 설치** - 완료
  - 신규 패키지 설치:
    - 필수: `npm install @notionhq/client@^5.0.0 date-fns date-fns-tz`
    - Kakao Maps 타입 (공식 JS API 사용 시): `npm install --save-dev @types/kakao.maps.d.ts`
    - Kakao Maps 대안 (POC 통과 시): `npm install react-kakao-maps-sdk`
  - `.env.local` 환경변수 파일 생성 및 `.env.example` 작성
    - `NOTION_API_KEY`, `NOTION_TRIPS_DB_ID`, `NOTION_PLACES_DB_ID`
    - `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` (클라이언트 노출 필수 — Script src URL에 직접 포함)
  - `next.config.ts`에 Notion 이미지 도메인(`notion.so`, `images.unsplash.com`) 추가
  - Kakao Maps 방식 결정:
    - 1순위: 공식 Kakao Maps JS API (`kakao.maps`) — `next/script strategy="afterInteractive"` + `kakao.maps.load()` 콜백 패턴 (공식 문서 안정, App Router 검증됨)
    - 대안: `react-kakao-maps-sdk` POC 검증 — 마커/팝업 동작 및 App Router 호환 확인 후 결정 (npm/GitHub 문서 접근 불가 이력 있어 유지 상태 불명확)

- ✅ **Task 002: 타입 정의 및 Notion DB 설계 확정**
  - `types/travel.ts` 생성: `Trip`, `Place`, `PlaceCategory`, `TripStatus` 타입 정의
  - `PlaceCategory`: `'교통' | '숙소' | '맛집' | '명소'` 유니온 타입
  - `TripStatus`: `'계획중' | '확정' | '완료'` 유니온 타입
  - Notion DB 스키마 문서화: Trips DB, Places DB 필드 및 Relations 확정
    - Places DB의 `Trip` 필드: Notion Relation 타입 (Trips DB 연결, 단방향)
    - 역방향 조회 미지원으로 Places DB 직접 필터 쿼리 방식 채택
  - `lib/constants.ts`에 여행 플래너 관련 상수 추가: `CATEGORY_COLORS`, `TRAVEL_ROUTES`, `CATEGORY_LABELS`

- ✅ **Task 003: 라우트 구조 및 빈 페이지 골격 생성**
  - `app/travel/page.tsx` 생성 (여행 목록 페이지 빈 골격)
  - `app/travel/[tripId]/page.tsx` 생성 (여행 대시보드 페이지 빈 골격)
  - `app/travel/[tripId]/map/page.tsx` 생성 (지도 페이지 빈 골격)
  - `app/api/revalidate/route.ts` 생성 (ISR on-demand revalidation API 빈 골격)
  - `lib/notion.ts` 파일 생성 (Notion API 클라이언트 초기화 및 타입 스텁)
  - `lib/map-utils.ts` 파일 생성 (카테고리별 마커 색상 유틸리티 스텁, `window.kakao` 타입 선언 위치)
  - 헤더 `NAV_ITEMS`에 "여행 플래너" 메뉴 추가 (`/travel` 라우트)

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> 더미 데이터를 활용해 모든 페이지의 UI를 완성합니다. 실제 Notion API 연동 전에 화면 흐름과 반응형 레이아웃을 검증합니다.

- ✅ **Task 004: 더미 데이터 및 공통 컴포넌트 구현** - 완료
  - `lib/dummy-data.ts` 생성: `Trip[]`, `Place[]` 더미 데이터 정의 (샘플 여행 2개, 장소 15개)
  - shadcn/ui 컴포넌트 추가: `Tabs`, `Select`, `Skeleton`, `Badge`, `Separator`
  - `components/travel/` 디렉토리 생성 및 컴포넌트 골격 파일 생성
    - `TripCard.tsx`, `TripSummary.tsx`, `CategoryTabs.tsx`, `DateFilter.tsx`, `PlaceCard.tsx`
    - `TripCardSkeleton.tsx`, `PlaceCardSkeleton.tsx` (Skeleton 로딩 UI)
  - `components/map/` 디렉토리 생성: `MapView.tsx`, `PlaceMarker.tsx`, `MarkerPopup.tsx` 골격

- ✅ **Task 005: 여행 목록 페이지 UI 완성 (더미 데이터)** - 완료
  - `components/travel/TripCard.tsx` 구현: 여행 제목, 기간, D-Day 배지, 총 장소 수 표시
  - `app/travel/page.tsx` UI 완성: 더미 데이터 기반 카드 그리드
    - 모바일 1열 / 태블릿 2열 / 데스크톱 3열 반응형 그리드
    - Skeleton 로딩 처리 (`Suspense` + `TripCardSkeleton`)
  - D-Day 계산 유틸리티: `date-fns`를 활용한 `calculateDday()` 함수 (`lib/date-utils.ts`)
  - 페이지 제목 및 빈 상태 UI 처리

- ✅ **Task 006: 여행 대시보드 페이지 UI 완성 (더미 데이터)** - 완료
  - `components/travel/TripSummary.tsx` 구현: D-Day, 기간, 카테고리별 장소 수 배지 표시
  - `components/travel/CategoryTabs.tsx` 구현: shadcn/ui Tabs 기반 전체/교통/숙소/맛집/명소 탭
  - `components/travel/DateFilter.tsx` 구현: 날짜 드롭다운 (shadcn/ui Select)
  - `components/travel/PlaceCard.tsx` 구현: 카테고리별 맞춤 정보 카드
    - 교통: 출발/도착 시간, 예약번호
    - 숙소: 체크인/체크아웃, 연락처
    - 맛집: 영업시간, 추천 메뉴, 평점
    - 명소: 운영시간, 입장료, 소요시간
  - `app/travel/[tripId]/page.tsx` UI 완성:
    - 데스크톱: 좌측 카드 목록 + 우측 사이드바 지도 레이아웃
    - 모바일: 하단 리스트/지도 토글 버튼
    - 새로고침 버튼 UI (기능 연동 전)
    - Skeleton 로딩 처리

- ✅ **Task 007: 지도 페이지 UI 완성 (더미 데이터)** - 완료
  - `lib/map-utils.ts` 구현:
    - 카테고리별 마커 색상 상수 `MARKER_COLORS` 정의
      - 교통: `#3B82F6`(blue-500), 숙소: `#22C55E`(green-500), 맛집: `#F97316`(orange-500), 명소: `#EF4444`(red-500)
    - `window.kakao` TypeScript 전역 타입 선언 (`declare global { interface Window { kakao: any } }`)
    - `Place` → `kakao.maps.LatLng` 변환 유틸리티
  - `components/map/MapView.tsx` 구현:
    - `"use client"` 필수 — `kakao.maps`는 브라우저 전용 API
    - `next/script strategy="afterInteractive"` 로 Kakao Maps SDK 로드 (초기 번들 최적화)
    - `kakao.maps.load()` 콜백 내에서 지도 초기화 — SDK 준비 완료 시점 보장
    - 지도 컨테이너 div에 고정 높이 필수: 모바일 `h-[calc(100vh-64px)]`, 데스크톱 사이드바 `h-full`
    - `next/dynamic`으로 SSR 비활성화 (`ssr: false`) — 카카오 지도는 브라우저 DOM 의존, 서버 렌더링 불가
  - `components/map/PlaceMarker.tsx` 구현:
    - `kakao.maps.CustomOverlay` 기반 카테고리별 색상 마커 (HTML/CSS 자유도 높아 MVP 권장)
    - `kakao.maps.MarkerImage` 방식은 이미지 파일 기반으로 대안
  - `components/map/MarkerPopup.tsx` 구현:
    - `kakao.maps.CustomOverlay` 기반 팝업 — InfoWindow 대비 카테고리별 색상 스타일 적용 용이
    - 팝업 내용: 장소명, 카테고리, 메모 표시
  - `app/travel/[tripId]/map/page.tsx` UI 완성:
    - `next/dynamic`으로 `MapView` 동적 import (`ssr: false`)
    - 상단 날짜 필터, 뒤로가기 버튼
    - 모바일 전체 화면 / 데스크톱 사이드바 반응형

---

### Phase 3: 핵심 기능 구현

> 더미 데이터를 실제 Notion API 연동으로 교체하고, 핵심 비즈니스 로직을 완성합니다.

- ✅ **Task 008: Notion API 클라이언트 및 데이터 페칭 구현** - 2026-03-18 완료
  - `lib/notion.ts` 완성:
    - `@notionhq/client@^5.0.0` 클라이언트 초기화
    - `fetchWithRetry(fetchFn, maxRetries)` 함수: 에러 유형별 exponential backoff 재시도
      - 429 Rate Limit: 1s → 2s → 4s, 최대 3회 재시도
      - 500/502/503 서버 에러: 0.5s → 1s, 최대 2회 재시도
      - 401 인증 에러: 즉시 실패, 재시도 없음
      - 모든 Notion API 호출을 `fetchWithRetry()`로 래핑
    - `getTrips()`: Trips DB 전체 조회 + Notion 응답 → `Trip[]` 타입 매핑
    - `getPlaces(tripId)`: Places DB를 Relation 필터로 직접 쿼리 + `Place[]` 타입 매핑
      - `do-while` + `start_cursor` 커서 페이지네이션으로 전체 수집 (Relation 25개 제한 근본 우회)
      - `filter: { property: "Trip", relation: { contains: tripId } }` — Places → Trips 단방향 Relation 쿼리
      - `sorts: [{ property: "VisitDate", direction: "ascending" }]`, `page_size: 100`
      - `response.next_cursor`가 `null`이 될 때까지 반복 (`has_more` 기반)
    - 에러 유형별 처리: 401 즉시 실패 / 429 재시도 / 5xx 재시도 / 네트워크 타임아웃
  - `lib/date-utils.ts` 시간대 처리 함수 구현:
    - `parseNotionDate()`: Notion UTC ISO 8601 → 한국 시간(`Asia/Seoul`) 변환 (`date-fns-tz` `utcToZonedTime` 활용)
    - `formatDateForNotionFilter()`: 한국 시간 선택 날짜 → UTC ISO 8601 변환 (`zonedTimeToUtc`)
    - `calculateDday()`: 한국 시간 기준 오늘 날짜와 여행 시작일 비교
    - 날짜 필터링 시 시간대 미처리 시 하루 오차 발생 가능 — 명시적 변환 필수
  - Playwright MCP로 Notion API 연동 테스트:
    - 여행 목록 데이터 정상 로딩 확인
    - 장소 데이터 Relation 필터 조회 확인
    - Rate Limit 시나리오 및 재시도 로직 동작 확인

- ✅ **Task 009: 여행 목록 페이지 Notion 연동** - 2026-03-18 완료
  - `app/travel/page.tsx`에 ISR 적용: `export const revalidate = 60`
  - 더미 데이터를 `getTrips()` 실제 API 호출로 교체
  - `generateStaticParams()` 설정: 기존 여행들 빌드 타임 사전 생성, 신규 여행은 첫 요청 시 ISR 동적 생성
  - Error Boundary 및 Suspense 설정: API 실패 + 캐시 없음 시 에러 화면 + 재시도 버튼
  - Playwright MCP로 여행 목록 페이지 E2E 테스트:
    - 여행 카드 렌더링 확인
    - D-Day 및 기간 표시 정확성 확인
    - 카드 클릭 시 대시보드 이동 확인
    - Skeleton 로딩 상태 확인

- ✅ **Task 010: 여행 대시보드 페이지 Notion 연동 및 필터링 로직 구현** - 2026-03-18 완료
  - `app/travel/[tripId]/page.tsx`에 ISR 적용 및 더미 데이터 교체
  - TanStack Query로 클라이언트 상태 관리: 카테고리 탭, 날짜 필터 상태
  - 카테고리 탭 필터링 로직: 클라이언트 메모리 필터링 (`useMemo` 활용, MVP 범위 10-50개 장소에서 적합)
  - 날짜 드롭다운 필터링 로직: `parseNotionDate()` + 한국 시간 기준 비교 (UTC+9 시간대 명시적 처리)
  - sonner 토스트 에러 알림 연동:
    - API 실패 + 캐시 있음: 경고 토스트 ("최신 데이터를 불러오지 못했습니다")
    - 빈 상태 UI: 필터 결과 없을 때 안내 메시지
  - Playwright MCP로 대시보드 E2E 테스트:
    - 카테고리 탭 전환 시 카드 목록 즉시 갱신 확인
    - 날짜 필터 선택 시 해당 날짜 일정만 표시 확인
    - 시간대 처리 정확성 확인 (한국 UTC+9 기준)

- ✅ **Task 010-bugfix: Notion DB 연동 안정화 (버그픽스/개선)** - 2026-03-18 완료
  - ✅ Notion DB 컬럼명 불일치 전면 수정 — 실제 DB 컬럼명(Name, StartDate, EndDate, Status, CoverImage, Category, VisitDate, Latitude, Longitude, Memo, trips)으로 매핑 수정, Status가 select가 아닌 status 타입임을 확인하여 헬퍼 함수 분리
  - ✅ VisitDate 날짜 범위 입력 지원 — Notion VisitDate를 start~end 범위로 입력 시 처리: `Place.visitDateEnd` 필드 추가, 날짜 필터 범위 매칭, PlaceCard 범위 표시 (4월 3일 ~ 4월 5일)
  - ✅ Memo "null" 문자열 방어 처리 — Notion DB에 "null" 텍스트로 입력된 경우 빈 값으로 처리

- ✅ **Task 011: 지도 페이지 Notion 연동 및 마커 기능 구현** - 2026-03-18 완료
  - ✅ `map/page.tsx` dummy-data → `getTrips()/getPlaces()` Notion API 교체
  - ✅ `MapView.tsx` 마커 재렌더링 구조 리팩터링 (overlaysRef + clearMarkers + renderMarkers 분리)
  - ✅ `MapViewWrapper.tsx` 날짜 필터 UI(shadcn Select) + 필터링 로직(visitDateEnd 범위 지원)
  - ✅ `lib/kakao-local.ts` 신규: 위경도 없는 장소 카카오 로컬 API 자동 보완 (Promise.all 병렬)
  - ✅ `app/api/geocode/route.ts` 신규: 카카오 REST API 프록시 Route Handler
  - ✅ 날짜 범위 필터 드롭다운에서 visitDateEnd 포함 전체 날짜 노출 (무한루프 버그 수정 포함)
  - ✅ 카카오 로컬 API 5초 타임아웃 추가 (무한 대기 방지)

- ✅ **Task 011-ext: Cost·CheckBox 기능 구현** - 2026-03-18 완료
  - ✅ `Place` 타입에 `cost`(number?), `checked`(boolean) 필드 추가
  - ✅ `lib/notion.ts`: `extractNumber`, `extractCheckbox` 헬퍼 추가, `parsePlace` 확장
  - ✅ `lib/dummy-data.ts`: `checked: false` 기본값 전체 추가 (타입 호환)
  - ✅ `PlaceCard`: 예상비용 표시 (메모 아래, 천단위 콤마 포맷)
  - ✅ `DashboardClient`: `checked=true` 장소만 표시, 필터 기준 예상 합계 표시 (필터 영역 아래 우측)
  - ✅ `map/page.tsx`: `checked=true` 장소만 지도 마커 표시
  - ✅ Notion DB `Latitude`/`Longitude` 컬럼 제거 — 코드에서 파싱 로직 및 `extractNumber` 제거

- ✅ **Task 011-home: 홈 화면 개선** - 2026-03-18 완료
  - ✅ 기술 스택 섹션(`TechStackSection`) 홈에서 제거
  - ✅ `HeroSection` 풀스크린 레이아웃(`min-h-[calc(100vh-4rem)]`)으로 전환
  - ✅ 특징 카드 3개 추가: 장소 관리(MapPin), 지도 시각화(Map), 날짜별 필터(CalendarDays)

- ✅ **Task 012: On-demand ISR 엔드포인트 및 새로고침 기능 구현** - 2026-03-18 완료
  - ✅ `app/api/revalidate/route.ts` 완성: `POST /api/revalidate` 핸들러 구현, `revalidatePath`로 `/travel`, `/travel/[tripId]`, `/travel/[tripId]/map` 3개 경로 캐시 무효화
  - ✅ `components/travel/RefreshButton.tsx` 신규 생성: `isLoading` 상태 관리, fetch POST 요청, `router.refresh()` 호출, sonner 성공/실패 토스트, `animate-spin` 로딩 스피너
  - ✅ `DashboardClient.tsx`: 더미 버튼 → `RefreshButton` 컴포넌트로 교체

- ✅ **Task 013: 통합 테스트 및 전체 사용자 플로우 검증** - 2026-03-18 완료
  - ✅ Playwright MCP로 전체 E2E 테스트 완료
  - ✅ 홈 → 여행 목록 → 대시보드 → 지도 플로우 검증
  - ✅ 카테고리 탭 필터, 날짜 필터 (범위 날짜 3일 모두 표시) 검증
  - ✅ 지도 마커 렌더링 확인
  - ✅ 뷰포트 375px / 768px / 1280px 반응형 레이아웃 모두 정상 확인

- ✅ **Task 014: 동해시 투어버스 노선 지도 표시** - 2026-03-18 완료
  - ✅ Notion Bus Stops DB(`NOTION_BUS_STOPS_DB_ID`) 신규 연동 — 기존 Place DB와 완전 분리
  - ✅ `types/travel.ts`: `BusStop` 인터페이스 Notion DB 스키마로 교체 (`id`, `name`, `address`, `order`, `url?`, `time?`, `latitude?`, `longitude?`)
  - ✅ `lib/kakao-local.ts`: `searchAddressCoords()` 추가 — 지번 주소 → 위경도 변환 (카카오 `search/address.json` API)
  - ✅ `lib/notion.ts`: `parseBusStop()` + `getBusStops(tripId)` 추가 — 커서 페이지네이션, 주소 기반 좌표 자동 보완, order 오름차순 정렬
  - ✅ `components/map/TourBusRoute.tsx`: 하드코딩 데이터 → Notion DB 연동, 이벤트 위임 방식 클릭 처리, 운행 시간(time) 팝업 표시
  - ✅ `components/map/MapView.tsx`: `busStops?: BusStop[]` prop 추가, 지도 초기화 후 `<TourBusRoute>` 조건부 렌더링
  - ✅ `components/map/MapViewWrapper.tsx`: 투어버스 토글 버튼(`🚌 투어버스 노선`) 추가, `showTourBus` 상태 관리
  - ✅ `app/travel/[tripId]/map/page.tsx`: `getBusStops()` 병렬 호출(`Promise.all`), `busStops` prop 전달
  - ✅ `lib/tour-bus-data.ts` 삭제 — Notion DB로 완전 대체
  - ✅ 이벤트 위임(event delegation) 방식 도입 — 카카오 CustomOverlay pan/zoom 시 DOM 재생성 문제 해결
  - ✅ 정류장 클릭 팝업: 정류장명 + 운행 시간(회차별 줄바꿈) + 네이버 지도 링크 표시

---

### Phase 4: 고급 기능 및 최적화 ✅

> 프로덕션 배포를 위한 성능 최적화, 다크모드 적용, 접근성 개선 및 배포 파이프라인을 구축합니다.

- ✅ **Task 015: 다크모드 적용 및 접근성 개선** - 완료
  - ✅ 여행 플래너 모든 컴포넌트에 다크모드 CSS 변수 적용
    - `TripCard`, `TripSummary`, `CategoryTabs`, `DateFilter`, `PlaceCard` 다크모드 스타일
    - 지도 페이지 다크모드 오버레이 처리
  - ✅ 접근성 개선:
    - `CategoryTabs`에 `aria-pressed` 속성 추가
    - `DateFilter`에 `aria-label` 추가
    - 마커 팝업 키보드 포커스 관리 (Escape로 닫기)
    - Skeleton 로딩에 `aria-live="polite"` 추가
    - 지도 컴포넌트 `aria-label` 설명 텍스트 추가

- ✅ **Task 016: 성능 최적화 및 번들 분석** - 완료
  - ✅ `next/image` 적용: `TripCard` 커버 이미지 최적화
    - Notion 이미지 도메인 `next.config.ts`에 등록 (`notion.so`, `images.unsplash.com`)
    - `width`, `height`, `loading="lazy"` 속성 설정
  - ✅ 번들 최적화:
    - `MapView` `next/dynamic` + `ssr: false` 동작 검증 — 지도 코드가 초기 번들에서 분리됨
    - `npm run build` 결과에서 지도 관련 청크 분리 확인
  - ✅ ISR 캐싱 전략 검증:
    - `revalidate: 60` 동작 확인
    - on-demand revalidation 후 캐시 갱신 확인
  - ✅ 대규모 데이터 대비 메모이제이션: `useMemo`로 필터링 로직 최적화

- ✅ **Task 017: Vercel 배포 및 모니터링 설정** - 완료
  - ✅ Vercel 프로젝트 생성 및 GitHub 연동
  - ✅ Vercel 환경변수 설정:
    - `NOTION_API_KEY`, `NOTION_TRIPS_DB_ID`, `NOTION_PLACES_DB_ID`
    - `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
  - ✅ Kakao Developers 플랫폼에 Vercel 배포 URL 도메인 추가 등록 (도메인 미등록 시 지도 API 차단)
  - ✅ 프로덕션 빌드 검증: `npm run build` 에러 없음 확인
  - ✅ Vercel Analytics 설정 (선택): Core Web Vitals 모니터링
  - ✅ 배포 후 전체 기능 smoke test:
    - 여행 목록 ISR 동작 확인
    - 대시보드 필터링 동작 확인
    - 지도 마커 렌더링 확인
    - 새로고침 on-demand revalidation 확인
  - ✅ README 업데이트: Notion DB 설정 가이드, 환경변수 가이드, Kakao Developers 앱 등록 절차 추가
  - 배포 URL: https://my-travel-mu.vercel.app/

---

### Phase 5: 사용자 경험 강화

> 배포 완료 이후 실사용 편의성을 높이기 위한 GPS 현재 위치 표시와 PWA 오프라인 지원을 추가합니다.

#### F020: GPS 현재 위치 표시

- ✅ **Task 018-A: use-geolocation 커스텀 훅 구현** - 2026-03-19 완료
  - `lib/use-geolocation.ts` 신규 생성
  - `navigator.geolocation.getCurrentPosition()` 래핑 — SSR 방어 처리 포함
  - 반환 인터페이스: `{ position, permissionDenied, isLoading, refresh }`
    - `position`: `{ lat: number, lng: number } | null`
    - `permissionDenied`: 권한 거부 시 `true` (PermissionDeniedError code 1)
    - `isLoading`: 조회 중 `true`
    - `refresh()`: `permissionDenied` 초기화 후 재조회
  - timeout: 10초, maximumAge: 30초

  **수락 기준:**
  - [x] position이 `{ lat, lng }` 객체 반환
  - [x] 권한 거부 시 `permissionDenied: true`, `position: null`
  - [x] `isLoading` 조회 중 `true` → 완료 후 `false`
  - [x] `refresh()` 호출 시 permissionDenied 초기화 후 재조회

- ✅ **Task 018-B: CurrentLocationMarker 컴포넌트 구현** - 2026-03-19 완료
  - `components/map/CurrentLocationMarker.tsx` 신규 생성
  - props: `{ map: any, position: { lat: number, lng: number } }`
  - `kakao.maps.CustomOverlay` 기반 파란 펄싱 원형 마커
  - Tailwind `animate-ping` 클래스 활용 (`@keyframes` 인라인 style 불가)
  - `useEffect` cleanup: `overlay.setMap(null)` — TourBusRoute.tsx 패턴 참고
  - `position` prop 변경 시 마커 위치 재생성

  **수락 기준:**
  - [x] 파란 펄싱 원형 마커 지도에 표시
  - [x] 컴포넌트 언마운트 시 마커 제거 (`setMap(null)`)
  - [x] `position` 변경 시 마커 위치 업데이트

- ✅ **Task 018-C: MapView + MapViewWrapper GPS 통합 및 E2E 테스트** - 2026-03-19 완료
  - `components/map/MapView.tsx` 수정:
    - `MapViewProps`에 `showCurrentLocation?: boolean`, `currentPosition?` prop 추가
    - `isMapInitialized && showCurrentLocation && currentPosition` 조건으로 `CurrentLocationMarker` 렌더링
  - `components/map/MapViewWrapper.tsx` 수정:
    - `use-geolocation` 훅 호출
    - `showCurrentLocation` state 추가 (`useState(false)`)
    - "📍 내 위치" 토글 버튼 추가 (투어버스 버튼 아래, 항상 표시)
      - 활성: `bg-blue-500 text-white`
      - 비활성: 기존 투어버스 비활성 스타일 동일
      - `permissionDenied`이면 `disabled` + "위치 권한 필요" 텍스트
    - `MapViewDynamic`에 `showCurrentLocation`, `currentPosition` prop 전달

  **수락 기준:**
  - [x] "내 위치" 버튼 토글 on/off 동작
  - [x] 위치 권한 거부 시 버튼 `disabled` 처리 (에러 토스트 없음)
  - [x] `position` 있을 때 파란 펄싱 마커 표시
  - [x] Playwright MCP E2E 테스트 통과

  **테스트 체크리스트 (Playwright MCP):**
  - [x] 지도 페이지 진입 후 "내 위치" 버튼 노출 확인
  - [x] 버튼 클릭 시 파란색 활성 상태 전환 확인
  - [x] 버튼 재클릭 시 비활성 복귀 확인
  - [x] 에러 메시지 미노출 확인

---

#### F021: PWA (Progressive Web App)

- **Task 019-A: PWA Manifest + 아이콘 + 레이아웃 메타태그**
  - `app/manifest.ts` 신규 생성 (Next.js 16 내장 `MetadataRoute.Manifest` 타입)
    - `/manifest.webmanifest` 경로로 자동 서빙 (`public/manifest.json` 방식 사용 불가)
    - `name`, `short_name`, `display: standalone`, `start_url: /`, `icons` (192x192, 512x512)
  - `public/icons/` 아이콘 파일 추가 (PNG 필수, SVG 불가)
    - `icon-192.png` (192×192), `icon-512.png` (512×512)
  - `app/layout.tsx` 수정 — `metadata` 객체에 PWA 필드 추가:
    - `appleWebApp: { capable: true, statusBarStyle: 'default', title: '여행 플래너' }`
    - `icons: { apple: '/icons/icon-192.png' }`

  **수락 기준:**
  - [ ] `/manifest.webmanifest` GET 200 응답
  - [ ] manifest 내 `name`, `icons`, `display: standalone` 포함
  - [ ] `apple-mobile-web-app-capable` 메타태그 반영

- **Task 019-B: Service Worker 구현 및 등록**
  - `public/sw.js` 수동 작성 (`next-pwa` 사용 불가 — Turbopack 비호환)
  - 캐싱 전략 (URL 패턴별 분기):
    - `/api/` 포함: **NetworkOnly** — On-demand ISR 새로고침 버튼 보호 필수
    - `dapi.kakao.com` 포함: **NetworkOnly** — 카카오 API 약관상 타일 캐싱 금지
    - `_next/static/`, `.js`, `.css`, `.png` 등 정적 자산: **Cache-first**
    - 나머지 HTML 페이지: **Network-first**, 실패 시 캐시, 캐시도 없으면 `/offline` 반환
  - `app/layout.tsx` 수정 — SW 등록 클라이언트 스크립트 추가
    - `providers/service-worker-register.tsx` 신규 생성 후 layout에 포함

  **수락 기준:**
  - [ ] Chrome DevTools > Application > Service Workers에서 sw.js 등록 확인
  - [ ] `/api/revalidate` POST 요청이 SW에 의해 차단되지 않음
  - [ ] 정적 자산(JS/CSS) 캐시 스토리지에 저장 확인
  - [ ] 네트워크 오프라인 전환 후 캐시된 페이지 로딩 확인

- **Task 019-C: 오프라인 폴백 페이지 + Playwright E2E 테스트**
  - `app/offline/page.tsx` 신규 생성 (`"use client"`)
    - UI: 지도 아이콘 + "오프라인 상태입니다" + 새로고침 버튼
    - `window.addEventListener("online", ...)` — 네트워크 복구 시 `window.location.href = '/'`
    - `router.push()` 사용 금지 (오프라인 환경에서 Next.js 라우터 동작 불안정)
  - Playwright MCP E2E 테스트 수행
  - `docs/ROADMAP.md` Task 018, 019 완료 체크박스 업데이트

  **수락 기준:**
  - [ ] `/offline` 페이지 렌더링 정상
  - [ ] 네트워크 복구 시 자동으로 `/` 리다이렉트
  - [ ] Playwright MCP 오프라인 시나리오 테스트 통과

  **테스트 체크리스트 (Playwright MCP):**
  - [ ] `/manifest.webmanifest` GET 200 응답 확인
  - [ ] `navigator.serviceWorker.ready` 확인
  - [ ] 오프라인 모드 전환 후 `/offline` 폴백 페이지 렌더링 확인
  - [ ] 오프라인 상태에서 캐시된 여행 목록 표시 확인
  - [ ] 네트워크 복구 시 자동 리다이렉트 확인

---

## 기술 스택 참고

| 분류 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | ISR, 서버 컴포넌트, 동적 라우팅 |
| 언어 | TypeScript 5 | `types/travel.ts` 타입 안전성 |
| 스타일링 | Tailwind CSS 4 + shadcn/ui | 반응형 UI, Tabs/Select/Skeleton/Badge |
| 데이터 페칭 | fetch() + ISR + TanStack Query | 서버: ISR 캐싱 / 클라이언트: 필터 상태 |
| Notion 연동 | @notionhq/client ^5.0.0 | Trips DB, Places DB Relation 필터 조회, `fetchWithRetry()` |
| 날짜 처리 | date-fns + date-fns-tz | D-Day 계산, UTC ↔ Asia/Seoul(UTC+9) 양방향 변환 |
| 지도 | **공식 Kakao Maps JS API** (`kakao.maps`) — 1순위 | `next/script strategy="afterInteractive"` + `kakao.maps.load()` 콜백, CustomOverlay 마커/팝업 |
| 지도 대안 | react-kakao-maps-sdk — POC 통과 시 선택 | React 래퍼 컴포넌트/훅 제공, 유지 상태 사전 검증 필요 |
| 알림 | sonner | ISR 갱신 성공/실패 토스트 |
| 배포 | Vercel | Next.js ISR on-demand revalidation 완벽 지원 |

---

## PRD 기능 → Task 매핑

| PRD 기능 ID | 기능명 | 구현 Task |
|------------|--------|-----------|
| F001 | 여행 목록 표시 | Task 005, Task 009 |
| F002 | 여행 대시보드 | Task 006, Task 010 |
| F003 | 카테고리 탭 필터링 | Task 006, Task 010 |
| F004 | 날짜 필터링 | Task 006, Task 010, Task 011 |
| F005 | 장소 카드 표시 | Task 006, Task 010 |
| F006 | 지도 마커 시각화 | Task 007, Task 011 |
| F007 | 마커 팝업 | Task 007, Task 011 |
| F008 | 비용 관리 | Task 011-ext |
| F009 | 체크박스 필터 | Task 011-ext |
| F010 | Notion ISR 동기화 | Task 008, Task 009, Task 012 |
| F011 | 반응형 모바일 레이아웃 | Task 006, Task 007 |
| F020 | GPS 현재 위치 표시 | Task 018 |
| F021 | PWA 오프라인 지원 | Task 019 |

---

## 리스크 관리

| 리스크 | 대응 방안 | Task |
|--------|-----------|------|
| react-kakao-maps-sdk POC 실패 | 공식 Kakao Maps JS API로 전환 — `next/script strategy="afterInteractive"` + `kakao.maps.load()` 콜백 패턴 (App Router 검증됨) | Task 001, Task 007 |
| Notion Rate Limit (3 RPS 초과) | `fetchWithRetry()` exponential backoff (429: 1s→2s→4s, 최대 3회) | Task 008 |
| 시간대(UTC vs UTC+9) 날짜 오차 | `date-fns-tz` `utcToZonedTime` / `zonedTimeToUtc` 명시적 양방향 변환 | Task 008, Task 010 |
| Notion Relations 25개 제한 | `do-while` + `start_cursor` 커서 페이지네이션으로 전체 수집 — Places DB 직접 쿼리 방식으로 25개 제한 근본 우회 | Task 008 |
| 번들 크기 증가 | `MapView` `next/dynamic` (`ssr: false`) 로 지도 코드 초기 번들에서 분리 | Task 007, Task 015 |
| 지도 컨테이너 렌더링 실패 | 지도 div에 고정 높이 필수 (`h-[calc(100vh-64px)]`) — 높이 0이면 카카오 지도 렌더링 불가 | Task 007 |
| Vercel 배포 후 지도 API 차단 | Kakao Developers 플랫폼에 Vercel 배포 URL 도메인 추가 등록 필수 | Task 016 |
