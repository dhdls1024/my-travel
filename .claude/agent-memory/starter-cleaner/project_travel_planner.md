---
name: my-travel project context
description: 나만의 여행 플래너 프로젝트 초기화 완료 상태 및 구조 정보
type: project
---

Notion 연동 개인 여행 플래너 프로젝트 초기화 완료 (2026-03-17).

**Why:** PRD 기반으로 Next.js 스타터킷의 데모/예제 코드를 제거하고 여행 플래너 전용 구조로 정리함.

**How to apply:** 이후 개발 시 ROADMAP.md의 Phase 1~4 순서대로 진행. 현재 Phase 0(사전 준비) 완료 상태.

## 초기화에서 제거된 파일

- `app/examples/` — 스타터킷 예제 페이지 전체
- `app/components/page.tsx` — 컴포넌트 쇼케이스 페이지
- `components/examples/` — 데모 컴포넌트들
- `components/sections/showcase-section.tsx` — 스타터킷 쇼케이스
- `components/sections/components-grid.tsx` — 컴포넌트 그리드

## 현재 상태

- `lib/constants.ts` — NAV_ITEMS(홈/여행 플래너), ROUTES(travel), MARKER_COLORS, CATEGORY_LABELS, SITE_CONFIG 업데이트 완료
- `components/sections/hero-section.tsx` — 여행 플래너 소개로 변경 완료
- `components/sections/tech-stack-section.tsx` — 여행 플래너 기술 스택으로 변경 완료
- `types/index.ts` — ComponentCardItem 등 스타터킷 타입 제거 완료
- `next.config.ts` — Notion/Unsplash 이미지 도메인 추가 완료
- `README.md` — PRD 기반 완전 재작성 완료
- `CLAUDE.md` — 프로젝트 한 줄 설명 + PRD 참조 링크 추가 완료

## 다음 개발 단계 (ROADMAP.md Phase 1)

- Task 001: 신규 패키지 설치 (`@notionhq/client`, `date-fns`, `date-fns-tz`, `@types/kakao.maps.d.ts`)
- Task 002: `types/travel.ts` 생성 (Trip, Place, PlaceCategory 타입)
- Task 003: 라우트 골격 생성 (`app/travel/`, `app/api/revalidate/`, `lib/notion.ts`, `lib/map-utils.ts`)
