---
name: 나만의 여행 플래너 프로젝트 컨텍스트
description: my-travel 프로젝트의 목적, 기술 스택, 개발 진행 상황 요약
type: project
---

Notion에 흩어진 여행 계획을 하나의 대시보드에서 즉시 조회할 수 있게 시각화하는 1인 개인용 여행 플래너 MVP 프로젝트.

**Why:** 기존 Next.js 스타터킷 위에 여행 관련 기능(여행 목록, 대시보드, 지도)을 추가하는 방식으로 개발.

**핵심 기술 스택 (신규 추가분)**
- @notionhq/client ^5.0.0 — Trips DB, Places DB Relation 필터 조회
- date-fns + date-fns-tz — D-Day 계산, UTC ↔ 한국 시간(Asia/Seoul) 변환
- react-kakao-maps-sdk (POC 실패 시 공식 Kakao Maps JS API로 전환)
- TanStack Query — 카테고리/날짜 필터 클라이언트 상태 관리

**라우트 구조**
- /travel — 여행 목록 (ISR revalidate: 60)
- /travel/[tripId] — 여행 대시보드
- /travel/[tripId]/map — 지도 페이지
- /api/revalidate — On-demand ISR 엔드포인트

**환경변수**
- NOTION_API_KEY, NOTION_TRIPS_DB_ID, NOTION_PLACES_DB_ID
- NEXT_PUBLIC_KAKAO_MAP_APP_KEY

**Notion DB 설계 핵심**
- Places.tripId 는 Trips DB에 대한 Relation 필드 (단순 텍스트 아님)
- API 필터: `{ property: 'tripId', relation: { contains: tripPageId } }`

**로드맵 위치:** docs/ROADMAP.md (총 16개 Task, Phase 1~4)
**PRD 위치:** docs/PRD.md
**검증 보고서:** docs/PRD_VALIDATION_REPORT.md

**How to apply:** 여행 플래너 관련 구현 요청 시 이 컨텍스트를 바탕으로 기존 스타터킷 패턴(서버 컴포넌트 기본, cn() 유틸리티, constants.ts 상수 관리)을 준수하며 작업.
