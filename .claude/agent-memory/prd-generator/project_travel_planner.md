---
name: 나만의 여행 플래너 프로젝트 컨텍스트
description: my-travel 프로젝트의 핵심 목적, 데이터 소스, 주요 설계 결정 사항
type: project
---

Notion을 데이터 소스로 사용하는 개인용 여행 대시보드 프로젝트. PRD는 docs/PRD.md에 저장됨.

**Why:** 1인 개발자가 Notion으로 관리하던 여행 계획(교통/숙소/맛집/명소)을 모바일에서 빠르게 조회하기 위해 만든 개인 프로젝트. 별도 배포 없이 Notion 수정이 웹에 반영되는 워크플로우(ISR revalidate: 60)가 핵심 요구사항.

**How to apply:** 기능 추가 제안 시 Notion 스키마(Trips DB + Places DB)와의 연동 가능성을 먼저 고려할 것. 인증 기능 없는 개인 전용 앱이므로 auth 관련 기능은 MVP에서 제외.

주요 설계 결정:
- 지도 API: Kakao Map API 선택 (국내 여행 중심, react-kakao-maps-sdk)
- 데이터 페칭: 서버 컴포넌트 ISR + @notionhq/client (서버 사이드 전용, API 키 노출 방지)
- 지도 컴포넌트: next/dynamic으로 dynamic import (초기 번들 최적화)
- 페이지 구조: /travel (목록) → /travel/[tripId] (대시보드) → /travel/[tripId]/map (지도)
- 신규 추가 패키지: @notionhq/client, react-kakao-maps-sdk, date-fns
