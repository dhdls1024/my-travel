# Playwright MCP 오류 수집 및 해결 계획

## Context
현재 웹 애플리케이션에서 발생하는 오류를 Playwright MCP를 활용해 수집, 분석, 해결한다.
개발 서버(localhost:3000)를 브라우저로 접속하여 각 예제 페이지를 순회하며 콘솔 에러와 네트워크 오류를 수집한다.

## 단계별 실행 계획

### 1단계: 오류 정보 수집
- 개발 서버 http://localhost:3000 접속
- 각 페이지 순회:
  - / (홈)
  - /examples/components
  - /examples/forms
  - /examples/layouts
  - /examples/hooks
  - /examples/data-fetching
  - /examples/optimization
  - /examples/ui-components
- browser_console_messages로 에러 수집
- browser_network_requests로 네트워크 오류 수집
- browser_snapshot으로 페이지 상태 스냅샷 캡처

### 2단계: 오류 원인 분석
- 수집된 콘솔 에러/경고 분류
- 네트워크 실패 요청 확인
- 관련 소스 파일 읽기 및 원인 파악

### 3단계: 오류 해결
- 파악된 오류에 대해 소스 파일 수정
- 타입 오류, import 오류, 런타임 오류 등 유형별 수정

### 4단계: 테스트
- 수정 후 페이지 재접속하여 오류 해소 확인
- 회귀 여부 확인

## 핵심 파일
- app/layout.tsx
- app/page.tsx
- app/examples/*/page.tsx
- components/examples/*.tsx
- lib/constants.ts
- types/index.ts

## 검증 방법
- browser_console_messages로 에러 0개 확인
- 모든 페이지 정상 렌더링 확인
- 네트워크 요청 성공 확인
