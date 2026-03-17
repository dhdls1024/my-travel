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
- `components/common/` — 여러 페이지에서 재사용하는 공통 컴포넌트
- `components/travel/` — 여행 플래너 전용 컴포넌트 (구현 예정)
- `components/map/` — 카카오 지도 관련 컴포넌트 (구현 예정)

**lib/ 파일 역할**:
- `lib/utils.ts` — `cn()` 유틸리티만 포함
- `lib/constants.ts` — 모든 정적 상수 (`ROUTES`, `MARKER_COLORS`, `CATEGORY_LABELS` 등)
- `lib/notion.ts` — Notion 클라이언트 + `fetchWithRetry` (구현 예정)
- `lib/map-utils.ts` — `window.kakao` 타입 선언, 마커 유틸리티 (구현 예정)
- `lib/date-utils.ts` — D-Day 계산, UTC ↔ Asia/Seoul 변환 (구현 예정)

**타입 파일**:
- `types/index.ts` — 공용 타입 (NavItem, TechStackItem 등)
- `types/travel.ts` — 여행 플래너 도메인 타입 (Trip, Place, PlaceCategory — 구현 예정)

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
- Relations 필터: `filter: { property: "Trip", relation: { contains: tripId } }`
- 커서 페이지네이션: `do-while` + `start_cursor` (Relations 25개 제한 대응)

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

## Claude Code Hooks

`.claude/settings.local.json`에 등록된 자동화:

| 이벤트 | 동작 |
|--------|------|
| `PostToolUse(Edit\|Write)` | `.ts/tsx/js/jsx/json/css` 저장 시 Prettier 자동 포매팅 |
| `PreToolUse(Bash)` | `rm -rf /`, `git reset --hard`, `git push --force` 등 위험 명령어 차단 |
| `SessionStart` | 현재 브랜치·변경파일·최근 커밋 컨텍스트 주입 |
| `Notification` / `Stop` | Slack 알림 (환경변수 `SLACK_WEBHOOK_URL` 필요) |

**주의**: `block-dangerous.sh`는 Bash 도구 실행 자체를 차단하므로 위험 패턴이 포함된 명령은 테스트용으로도 실행 불가.
