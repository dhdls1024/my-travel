# CLAUDE.md

**나만의 여행 플래너** — Notion에 흩어진 여행 계획(교통/숙소/맛집/명소)을 하나의 대시보드에서 즉시 조회할 수 있게 시각화하는 개인용 여행 플래너입니다.

상세 프로젝트 요구사항은 @/docs/PRD.md 참조

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

shadcn/ui 컴포넌트 추가 (새 컴포넌트는 `components/ui/`에 자동 생성):
```bash
npx shadcn@latest add <component-name>
```

## 프로젝트 구조

```
app/                        # Next.js App Router
  layout.tsx                # 루트 레이아웃 (ThemeProvider, Header, Footer, Toaster)
  page.tsx                  # 홈페이지 (HeroSection + TechStackSection)
  travel/                   # 여행 플래너 라우트 (Phase 1~3에서 구현 예정)
    page.tsx                # 여행 목록 페이지 (F001, F010)
    [tripId]/
      page.tsx              # 여행 대시보드 페이지 (F002~F005, F010, F011)
      map/
        page.tsx            # 지도 페이지 (F004, F006, F007, F011)
  api/
    revalidate/
      route.ts              # On-demand ISR revalidation (F010)

components/
  ui/                       # shadcn/ui 자동 생성 컴포넌트 (직접 수정 주의)
  layout/                   # Header, Footer, Container, MobileNav
  sections/                 # HeroSection, TechStackSection 페이지 섹션
  common/                   # ThemeToggle, BackButton, PageHeader 공통 컴포넌트
  travel/                   # 여행 플래너 전용 컴포넌트 (Phase 2에서 생성 예정)
    TripCard.tsx            # 여행 카드 (F001)
    TripSummary.tsx         # D-Day + 카테고리 카운트 배지 (F002)
    CategoryTabs.tsx        # 카테고리 탭 필터 (F003)
    DateFilter.tsx          # 날짜 드롭다운 필터 (F004)
    PlaceCard.tsx           # 카테고리별 맞춤 장소 카드 (F005)
  map/                      # 지도 컴포넌트 (Phase 2에서 생성 예정)
    MapView.tsx             # 카카오 지도 루트 컴포넌트 (F006)
    PlaceMarker.tsx         # 카테고리별 색상 마커 (F006)
    MarkerPopup.tsx         # 마커 클릭 팝업 (F007)

lib/
  utils.ts                  # cn() 유틸리티 (clsx + tailwind-merge)
  constants.ts              # NAV_ITEMS, TECH_STACK, ROUTES, MARKER_COLORS, SITE_CONFIG
  notion.ts                 # Notion API 클라이언트 및 fetchWithRetry (Phase 1~3에서 구현)
  map-utils.ts              # 카테고리별 마커 색상, window.kakao 타입 선언 (Phase 2에서 구현)
  date-utils.ts             # D-Day 계산, UTC ↔ Asia/Seoul 변환 (Phase 2에서 구현)

types/
  index.ts                  # 공유 TypeScript 타입 정의 (NavItem, TechStackItem 등)
  travel.ts                 # 여행 플래너 타입 (Trip, Place, PlaceCategory — Phase 1에서 구현)
```

## 기술 스택

- **Next.js 16** + **React 19** + **TypeScript 5** (App Router)
- **Tailwind CSS 4** — PostCSS 플러그인 방식, `@import "tailwindcss"` 사용
- **shadcn/ui** — `components/ui/`에 복사 방식으로 설치
- **next-themes** — `ThemeProvider`로 `app/layout.tsx`에서 다크모드 처리
- **react-hook-form + zod** — 폼 검증
- **sonner** — 토스트 알림 (`<Toaster richColors />`)
- **usehooks-ts + react-responsive** — 커스텀 훅
- **@tanstack/react-query** — 클라이언트 데이터 페칭 및 캐싱
- **prettier** — 코드 포매터 (PostToolUse hook으로 자동 실행)

## 주요 패턴

**Path alias**: `@/*` → 프로젝트 루트 (`tsconfig.json`)

**cn() 유틸리티**: 조건부 클래스 병합 시 항상 `lib/utils.ts`의 `cn()` 사용
```tsx
import { cn } from "@/lib/utils"
```

**서버/클라이언트 컴포넌트 분리**: 기본은 서버 컴포넌트, 인터랙션이 필요할 때만 `"use client"` 추가. Header는 서버 컴포넌트이고 ThemeToggle/MobileNav만 클라이언트 컴포넌트.

**상수 관리**: `lib/constants.ts`에 모든 정적 데이터 정의:
- `NAV_ITEMS` — 네비게이션 메뉴 (홈, 여행 플래너)
- `TECH_STACK` — 기술 스택 정보 (여행 플래너 기반)
- `ROUTES` — 앱 라우트 (홈, 여행 목록, 대시보드, 지도, API)
- `MARKER_COLORS` — 카테고리별 지도 마커 색상 (교통/숙소/맛집/명소)
- `CATEGORY_LABELS` — 카테고리 레이블 (전체/교통/숙소/맛집/명소)
- `SITE_CONFIG` — 사이트 메타데이터

타입은 `types/index.ts`에 선언.

**다크모드**: CSS 변수 기반 (`attribute="class"`). 테마 전환 시 `disableTransitionOnChange` 적용.

## 데이터 페칭 및 상태 관리

**TanStack Query**: `@tanstack/react-query` 사용. 클라이언트 컴포넌트에서 비동기 데이터 페칭 시 활용.

**서버 컴포넌트 fetch**: 직접 `fetch()`로 데이터 조회. Skeleton을 이용한 로딩 상태 표시 패턴 적용.

## 외부 이미지 도메인

`next.config.ts`에 허용된 도메인:
- `picsum.photos` — 예제 이미지 (seed 파라미터로 동일 이미지 생성 가능)

새 도메인 추가 시 `images.remotePatterns`에 등록.

## Claude Code Hooks

`.claude/settings.local.json`에 등록된 자동화 hook:

| 이벤트 | 파일 | 동작 |
|--------|------|------|
| `PostToolUse(Edit\|Write)` | `prettier-format.sh` | `.ts/tsx/js/jsx/json/css` 저장 시 자동 포매팅 |
| `PreToolUse(Bash)` | `block-dangerous.sh` | `rm -rf /`, `git reset --hard`, `git push --force` 등 위험 명령어 차단 |
| `SessionStart(startup)` | `session-context.sh` | 세션 시작 시 현재 브랜치·변경파일·최근 커밋 컨텍스트 주입 |
| `Notification(permission_prompt)` | `slack-permission.sh` | 권한 요청 시 Slack 알림 |
| `Stop` | `slack-complete.sh` | 작업 완료 시 Slack 알림 |

**주의**: `block-dangerous.sh`는 실제로 Bash 도구 실행 자체를 차단함. 위험 패턴이 포함된 명령은 테스트용으로도 실행 불가.
