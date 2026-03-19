# 나만의 여행 플래너

Notion에 흩어진 여행 계획(교통/숙소/맛집/명소)을 하나의 대시보드에서 즉시 조회할 수 있게 시각화하는 개인용 여행 플래너입니다.

**배포 URL**: https://my-travel-mu.vercel.app/

## 프로젝트 개요

**목적**: Notion으로 여행 계획을 관리하는 솔로 개발자 겸 여행자를 위한 개인 프로젝트
**사용자**: 1인 (개인 프로젝트)
**배포**: Vercel (Next.js ISR on-demand revalidation 완벽 지원)

## 주요 페이지

1. **홈** (`/`) — 서비스 소개 및 여행 플래너 진입 CTA
2. **여행 목록** (`/travel`) — Notion Trips DB ISR 기반 여행 카드 그리드, D-Day 및 기간 표시
3. **여행 대시보드** (`/travel/[tripId]`) — 카테고리 탭 필터(교통/숙소/맛집/명소), 날짜 드롭다운, 장소 카드 목록
4. **지도** (`/travel/[tripId]/map`) — Kakao Maps 카테고리별 색상 마커 + CustomOverlay 팝업, 날짜 필터 연동

## 핵심 기능

- **F001 여행 목록**: Notion Trips DB를 ISR(revalidate: 60)로 읽어 카드 그리드 렌더링
- **F002 여행 대시보드**: D-Day, 카테고리별 장소 수 배지, 통합 장소 조회
- **F003 카테고리 탭 필터링**: 전체 / 교통 / 숙소 / 맛집 / 명소 탭 즉시 전환
- **F004 날짜 필터링**: 특정 날짜 일정만 카드 목록에 표시 (한국 UTC+9 기준)
- **F005 장소 카드**: 카테고리별 맞춤 정보 — 교통(예약번호/시간), 숙소(체크인아웃), 맛집(추천메뉴/평점), 명소(입장료/소요시간)
- **F006 지도 마커**: 위도/경도 기반 카테고리별 색상 마커 (교통 파랑/숙소 초록/맛집 주황/명소 빨강)
- **F007 마커 팝업**: CustomOverlay 클릭 팝업 — 장소명, 카테고리, 메모 표시
- **F010 Notion ISR 동기화**: 자동 갱신(60초) + 새로고침 버튼 on-demand revalidation
- **F011 반응형 레이아웃**: 모바일 1열 + 리스트/지도 토글 / 태블릿 2열 / 데스크톱 3열 + 사이드바 지도

## 기술 스택

| 분류 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | ISR, 서버 컴포넌트, 동적 라우팅 |
| 언어 | TypeScript 5 | Trip, Place 타입 안전성 |
| 스타일링 | Tailwind CSS 4 + shadcn/ui | 반응형 UI, Tabs/Select/Skeleton/Badge |
| 데이터 페칭 | fetch() + ISR + TanStack Query | 서버: ISR 캐싱 / 클라이언트: 필터 상태 |
| Notion 연동 | @notionhq/client ^5.0.0 | Trips/Places DB Relation 필터 조회 |
| 날짜 처리 | date-fns + date-fns-tz | D-Day 계산, UTC ↔ Asia/Seoul 변환 |
| 지도 | Kakao Maps 공식 JS API | CustomOverlay 마커/팝업, next/dynamic ssr:false |
| 알림 | sonner | ISR 갱신 성공/실패 토스트 |
| 다크모드 | next-themes | CSS 변수 기반 |
| 배포 | Vercel | on-demand revalidation 지원 |

## 시작하기

### 필수 조건

1. **Notion DB 생성** — Trips DB + Places DB (컬럼 설정은 [PRD 참조](./docs/PRD.md))
2. **Kakao Developers 앱 등록** — [developers.kakao.com](https://developers.kakao.com)에서 JavaScript 키 발급, `http://localhost:3000` 도메인 등록
3. **환경변수 설정** — `.env.local` 파일 생성:

```env
NOTION_API_KEY=secret_xxxxx
NOTION_TRIPS_DB_ID=xxxxx
NOTION_PLACES_DB_ID=xxxxx
NOTION_BUS_STOPS_DB_ID=xxxxx
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=xxxxx
KAKAO_LOCAL_API_KEY=xxxxx
```

### 신규 패키지 설치

```bash
npm install @notionhq/client@^5.0.0 date-fns date-fns-tz
npm install --save-dev @types/kakao.maps.d.ts
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

### 빌드 및 배포

```bash
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 시작
npm run lint    # ESLint 검사
```

## 개발 상태

- [x] 기본 프로젝트 구조 설정 (Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui)
- [x] PRD 작성 및 검증 완료 (2026-03-17)
- [x] 개발 로드맵 수립 (Phase 0~4)
- [x] Phase 1: 애플리케이션 골격 구축 (타입 정의, 라우트 구조, Notion 클라이언트)
- [x] Phase 2: UI/UX 완성 (더미 데이터 기반 모든 페이지 구현)
- [x] Phase 3: Notion API 실제 연동 + 카카오 지도 마커/팝업 구현
- [x] Phase 4: 다크모드, 성능 최적화, Vercel 배포 완료

## 문서

- [PRD](./docs/PRD.md) — 상세 요구사항, 데이터 모델, Notion DB 설정 가이드
- [개발 로드맵](./docs/ROADMAP.md) — Phase별 Task 목록 및 구현 계획
- [개발 가이드](./CLAUDE.md) — 코드 컨벤션, 프로젝트 구조, 개발 패턴
