---
name: my-travel 프로젝트 Kakao Maps 통합 패턴
description: my-travel 프로젝트에서 확정된 Kakao Maps 구현 전략, 환경변수 이름, 컴포넌트 위치
type: project
---

공식 Kakao Maps JS API (`kakao.maps`) + `next/script` 방식을 1순위로 채택. `react-kakao-maps-sdk`는 npm/GitHub 문서 접근 불가 이력(403/404)으로 Week 2 Day 1 POC 후 결정.

**Why:** `react-kakao-maps-sdk` 유지 상태 불명확 — 문서 접근 불가 이력 존재. 공식 JS API는 apis.map.kakao.com에서 안정적으로 제공.

**How to apply:** 지도 컴포넌트 구현 시 공식 JS API 패턴 우선 제안. react-kakao-maps-sdk 질문 시 POC 검증 필요성 언급.

## 확정된 설정값

- 환경변수: `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` (클라이언트 노출 필요, NEXT_PUBLIC_ 필수)
- 지도 컨테이너 높이: `h-[calc(100vh-64px)]` (모바일 전체화면), `h-full` (데스크톱 사이드바)
- SSR 비활성화: `next/dynamic({ ssr: false })` 필수

## 마커 색상 상수

```ts
// lib/map-utils.ts
export const MARKER_COLORS = {
  교통: "#3B82F6", // blue-500
  숙소: "#22C55E", // green-500
  맛집: "#F97316", // orange-500
  명소: "#EF4444", // red-500
} as const
```

## 팝업 방식

`kakao.maps.CustomOverlay` 채택 (InfoWindow 대비 커스텀 스타일 자유도 높아 카테고리별 색상 팝업에 적합)

## 컴포넌트 위치

- `components/map/MapView.tsx` — 지도 루트, next/dynamic ssr:false 래핑
- `components/map/PlaceMarker.tsx` — CustomOverlay 마커
- `components/map/MarkerPopup.tsx` — CustomOverlay 팝업
- `lib/map-utils.ts` — MARKER_COLORS 상수, LatLng 변환 유틸, window.kakao 타입 선언

## SDK 초기화 패턴

```tsx
<Script
  src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&autoload=false`}
  strategy="afterInteractive"
  onLoad={() => window.kakao.maps.load(initMap)}
/>
```
