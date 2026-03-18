# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**나만의 여행 플래너** — Notion에 흩어진 여행 계획(교통/숙소/맛집/명소)을 하나의 대시보드에서 즉시 조회할 수 있게 시각화하는 개인용 여행 플래너입니다.

상세 요구사항은 `docs/PRD.md`, 개발 계획은 `docs/ROADMAP.md` 참조.

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
npx shadcn@latest add <component-name>  # shadcn/ui 컴포넌트 추가
```

## 아키텍처

Next.js App Router 기반. 데이터는 Notion API에서 ISR(`revalidate: 60`)로 가져오며, 지도는 Kakao Maps 공식 JS API를 사용한다.

**라우트 구조** (구현 예정 포함):
```
app/
  page.tsx                    # 홈 (HeroSection + TechStackSection)
  travel/page.tsx             # 여행 목록 (Notion DB 조회)
  travel/[tripId]/page.tsx    # 여행 대시보드 (카테고리 필터, 장소 목록)
  travel/[tripId]/map/page.tsx # 카카오 지도 (마커, CustomOverlay)
  api/revalidate/route.ts     # On-demand ISR revalidation
```

**컴포넌트 배치 규칙**:
- `components/ui/` — shadcn/ui 자동 생성, **직접 수정 금지**
- `components/layout/` — Header, Footer, Container, MobileNav
- `components/sections/` — 페이지 섹션 (HeroSection 등)
- `components/common/` — BackButton, PageHeader, ThemeToggle 등 공통 컴포넌트
- `components/travel/` — TripCard, TripSummary, CategoryTabs, DateFilter, PlaceCard, DashboardClient 등
- `components/map/` — MapView, MapViewWrapper, PlaceMarker, MarkerPopup

**lib/ 파일 역할**:
- `lib/utils.ts` — `cn()` 유틸리티만 포함
- `lib/constants.ts` — 모든 정적 상수 (`ROUTES`, `MARKER_COLORS`, `CATEGORY_LABELS` 등)
- `lib/notion.ts` — Notion 클라이언트 + `fetchWithRetry` (지수 백오프 재시도), `getTrips()`, `getPlaces(tripId)`
- `lib/map-utils.ts` — `window.kakao` 타입 선언, `Place` → `kakao.maps.LatLng` 변환 유틸리티
- `lib/date-utils.ts` — D-Day 계산, UTC ↔ Asia/Seoul 변환 (`parseNotionDate`, `calculateDday`)
- `lib/dummy-data.ts` — 개발용 더미 데이터 (Trip[], Place[])

**타입 파일**:
- `types/index.ts` — 공용 타입 (NavItem, TechStackItem 등)
- `types/travel.ts` — `Trip`, `Place`, `PlaceCategory`(`'교통'|'숙소'|'맛집'|'명소'`), `TripStatus`(`'계획중'|'확정'|'완료'`)

## 핵심 패턴

**라우트 하드코딩 금지** — 반드시 `ROUTES` 상수 사용:
```ts
import { ROUTES } from "@/lib/constants"
ROUTES.travel.dashboard(tripId)  // "/travel/[tripId]"
```

**서버 vs 클라이언트 컴포넌트**: 기본은 서버 컴포넌트. `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API 사용 시에만 `"use client"` 추가. 카카오 지도 컴포넌트는 반드시 `"use client"`.

**클라이언트 데이터 페칭**: TanStack Query 의무 사용 (`useEffect + fetch` 직접 사용 금지). QueryProvider는 `providers/query-provider.tsx`.

**Kakao Maps 초기화 패턴**:
```tsx
// next/script strategy="afterInteractive" + kakao.maps.load() 콜백 필수
// 지도 컨테이너에 고정 높이 필수 (height: 0이면 렌더링 안 됨)
```

**Notion API 패턴**:
- `lib/notion.ts`는 서버 사이드 전용 (`window` 접근 시 throw)
- Places → Trips 단방향 Relation 필터: `filter: { property: "trips", relation: { contains: tripId } }`
- 커서 페이지네이션: `do-while` + `start_cursor` (Relations 25개 제한 대응)
- `fetchWithRetry()`: 429 → 1s/2s/4s 재시도, 5xx → 0.5s/1s 재시도, 401 → 즉시 실패
- Notion DB 실제 컬럼명: `Name`, `StartDate`, `EndDate`, `Status`(status 타입), `CoverImage`, `Category`, `VisitDate`, `Memo`, `URL`, `trips`(Relation)
- 위경도는 Notion DB에 저장하지 않음 — `getPlaces()`에서 카카오 로컬 API(`lib/kakao-local.ts`)로 장소명 검색해 자동 보완
- `VisitDate`는 단일 날짜 또는 start~end 범위(`Place.visitDateEnd`)로 입력 가능; Memo가 `"null"` 문자열인 경우 빈값 처리

**외부 이미지 도메인** (`next.config.ts`에 등록됨):
- `**.notion.so` — Notion 커버 이미지
- `prod-files-secure.s3.us-west-2.amazonaws.com` — Notion S3
- `images.unsplash.com` — Notion 커버 이미지 소스

## 코드 스타일

- 들여쓰기: 스페이스 2칸, **세미콜론 금지**
- 매직넘버 금지 → `lib/constants.ts`에 상수 정의
- 조건부 클래스 병합: `cn()` 사용 (`@/lib/utils`)
- 공유 타입은 반드시 `types/index.ts` 또는 `types/travel.ts`에 선언
- 함수 30줄 초과 시 분리
- 주석: 함수/메서드 역할 주석 필수, 복잡한 설계 결정은 이유 주석 추가

## 개발 워크플로우

새 작업은 `/tasks/XXX-description.md` 형식으로 생성하고, 완료 후 `docs/ROADMAP.md`를 업데이트한다. API/비즈니스 로직 작업 시 Playwright MCP로 E2E 테스트 수행 필수. 구현 현황은 `docs/ROADMAP.md` 참고.

**현재 구현 완료 (Phase 0~3 일부)**:
- Phase 1 (Task 001~003): 환경설정, 타입 정의, 라우트 골격
- Phase 2 (Task 004~007): 더미 데이터 기반 전체 UI 완성
- Phase 3 (Task 008~010): Notion API 연동, 날짜 필터링, 버그픽스

**다음 작업**: Task 012 (On-demand ISR 새로고침 버튼)

## Claude Code Hooks

`.claude/settings.local.json`에 등록된 자동화:

| 이벤트 | 동작 |
|--------|------|
| `PostToolUse(Edit\|Write)` | `.ts/tsx/js/jsx/json/css` 저장 시 Prettier 자동 포매팅 |
| `PreToolUse(Bash)` | `rm -rf /`, `git reset --hard`, `git push --force` 등 위험 명령어 차단 |
| `SessionStart` | 현재 브랜치·변경파일·최근 커밋 컨텍스트 주입 |
| `Notification` / `Stop` | Slack 알림 (환경변수 `SLACK_WEBHOOK_URL` 필요) |

**주의**: `block-dangerous.sh`는 Bash 도구 실행 자체를 차단하므로 위험 패턴이 포함된 명령은 테스트용으로도 실행 불가.
