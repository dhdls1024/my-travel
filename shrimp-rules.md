# Development Guidelines

## Project Overview

- **프로젝트**: my-travel — Next.js 16 App Router 기반 UI 스타터킷 (shadcn/ui 쇼케이스)
- **스택**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- **목적**: 예제 페이지와 컴포넌트 데모를 통해 기술 스택 활용 패턴을 제시

---

## Project Architecture

```
app/                        # Next.js App Router 라우트
  layout.tsx                # 루트 레이아웃 — ThemeProvider, QueryProvider, Header, Footer, Toaster 포함
  page.tsx                  # 홈 (HeroSection + ShowcaseSection)
  examples/[name]/page.tsx  # 예제 페이지 패턴
  examples/data-fetching/
    loading.tsx             # Skeleton 로딩 UI
    client-section.tsx      # TanStack Query 클라이언트 컴포넌트

components/
  ui/                       # shadcn/ui 자동 생성 — 직접 수정 금지
  layout/                   # Header, Footer, Container, MobileNav
  sections/                 # HeroSection, TechStackSection, ShowcaseSection 등 페이지 섹션
  common/                   # ThemeToggle, BackButton, PageHeader 등 재사용 공통 컴포넌트
  examples/                 # 예제 페이지 전용 데모 컴포넌트

lib/
  utils.ts                  # cn() 유틸리티만 포함
  constants.ts              # 모든 정적 데이터 상수

types/
  index.ts                  # 공유 TypeScript 타입 정의

providers/
  query-provider.tsx        # TanStack Query QueryClient Provider (클라이언트 컴포넌트)
```

---

## Code Standards

### 포매팅
- 들여쓰기: 스페이스 2칸
- **세미콜론 사용 금지**
- 변수명/함수명: 영어 camelCase
- 함수 30줄 초과 시 분리
- 매직넘버 금지 — 반드시 상수로 정의

### TypeScript
- 공유 타입은 반드시 `types/index.ts`에 선언
- `as const` — 변경 불가 상수 배열/객체에 적용
- 컴포넌트 props 타입은 인라인 interface 또는 `types/index.ts` 참조

### 주석
- 함수/메서드/라이브러리/MCP 사용 시 역할 주석 필수
- 복잡한 설계 결정에는 "왜 이렇게 작성했는지" 이유 주석 추가
- 예제 코드 내 한글 주석으로 흐름 설명

---

## Component Implementation Standards

### 서버 vs 클라이언트 컴포넌트
- **기본값: 서버 컴포넌트** — `"use client"` 없이 작성
- `"use client"` 추가 조건: useState, useEffect, 이벤트 핸들러, 브라우저 API 사용 시
- Header는 서버 컴포넌트 유지, ThemeToggle/MobileNav만 클라이언트

### 컴포넌트 배치 규칙
- 레이아웃 컴포넌트 → `components/layout/`
- 페이지 섹션 → `components/sections/`
- 재사용 공통 컴포넌트 → `components/common/`
- 예제 페이지 전용 데모 → `components/examples/`
- **`components/ui/`는 shadcn/ui 자동 생성 전용 — 직접 수정 금지**

### 스타일링
- 조건부 클래스 병합 시 항상 `cn()` 사용:
  ```tsx
  import { cn } from "@/lib/utils"
  className={cn("base-class", condition && "conditional-class")}
  ```
- Tailwind CSS 4 사용: CSS 파일에서 `@import "tailwindcss"` 방식
- 다크모드: `dark:` 접두사 또는 CSS 변수 기반 자동 전환

---

## Constants & Routes Management

### lib/constants.ts 수정 규칙
- 새 라우트 추가 → `ROUTES` 객체에 추가
- 새 네비게이션 항목 → `NAV_ITEMS` 배열에 추가
- 새 예제 카드 → `COMPONENT_CARDS` 배열에 추가 (`ComponentCardItem` 타입 준수)
- 새 외부 이미지 URL → `IMAGE_URLS` 객체에 추가
- **라우트 문자열 하드코딩 금지** — 반드시 `ROUTES` 상수 사용

### 상수 추가 예시
```ts
// 올바른 방법
import { ROUTES } from "@/lib/constants"
href={ROUTES.examples.forms}

// 금지
href="/examples/forms"
```

---

## Data Fetching Standards

### 서버 컴포넌트 (기본)
```tsx
// async 서버 컴포넌트에서 직접 fetch
const data = await fetch("https://api.example.com/data")
```
- `loading.tsx` 파일로 Skeleton 로딩 UI 제공

### 클라이언트 컴포넌트
```tsx
// TanStack Query 사용
import { useQuery } from "@tanstack/react-query"
```
- QueryProvider는 `providers/query-provider.tsx`에 정의됨
- 클라이언트 데이터 페칭 시 TanStack Query 의무 사용

---

## Form Implementation Standards

- react-hook-form + zod 조합 사용
- zod 스키마로 유효성 검증
- shadcn/ui `<Form>` 컴포넌트 사용 (`components/ui/form.tsx`)
- 폼 예제는 `app/examples/forms/page.tsx` 참고

---

## Third-party Library Standards

| 라이브러리 | 용도 | 사용 위치 |
|---|---|---|
| `next-themes` | 다크모드 | `app/layout.tsx`의 ThemeProvider |
| `sonner` | 토스트 알림 | `<Toaster richColors />` in layout |
| `@tanstack/react-query` | 클라이언트 데이터 페칭 | 클라이언트 컴포넌트 |
| `react-hook-form` + `zod` | 폼 검증 | 폼 컴포넌트 |
| `usehooks-ts` | 커스텀 훅 | 클라이언트 컴포넌트 |
| `next/image` | 이미지 최적화 | 모든 이미지 렌더링 |

### shadcn/ui 컴포넌트 추가
```bash
# 반드시 이 명령어로만 추가
npx shadcn@latest add <component-name>
```
- 설치 후 `components/ui/`에 자동 생성됨
- **직접 파일 생성 또는 수정 금지**

### 이미지 외부 도메인
- 허용된 도메인: `picsum.photos` (next.config.ts에 등록됨)
- 새 도메인 필요 시 `next.config.ts`의 `images.remotePatterns`에 추가

---

## New Page / Example Creation

### 새 예제 페이지 추가 순서
1. `app/examples/[name]/page.tsx` 생성
2. `lib/constants.ts`의 `ROUTES.examples`에 라우트 추가
3. `lib/constants.ts`의 `COMPONENT_CARDS`에 카드 항목 추가
4. 필요 시 `components/examples/[name]-demo.tsx` 데모 컴포넌트 생성

### 파일명 컨벤션
- 컴포넌트 파일: `kebab-case.tsx` (예: `hero-section.tsx`)
- 예외: 기존 PascalCase 파일(`StatusBadge.tsx`) 있으나 신규 파일은 kebab-case 사용

---

## Key File Interaction Rules

| 변경 사항 | 동시 수정 필요 파일 |
|---|---|
| 새 라우트 추가 | `lib/constants.ts` (ROUTES) |
| 새 예제 페이지 추가 | `lib/constants.ts` (ROUTES + COMPONENT_CARDS) |
| 새 네비게이션 항목 추가 | `lib/constants.ts` (NAV_ITEMS) |
| 새 공유 타입 추가 | `types/index.ts` |
| 새 외부 이미지 도메인 추가 | `next.config.ts` (remotePatterns) + `lib/constants.ts` (IMAGE_URLS) |
| 사이트 메타데이터 변경 | `lib/constants.ts` (SITE_CONFIG) |

---

## AI Decision-making Standards

### 컴포넌트 위치 결정 트리
```
새 컴포넌트 필요
├── shadcn/ui 기본 컴포넌트? → npx shadcn@latest add → components/ui/
├── 레이아웃 구조 컴포넌트? → components/layout/
├── 페이지 섹션 컴포넌트? → components/sections/
├── 여러 페이지에서 재사용? → components/common/
├── 예제 페이지 전용 데모? → components/examples/
└── 특정 페이지 전용? → app/[page]/components/
```

### "use client" 추가 판단
- useState, useEffect, useRef → 필수 추가
- 이벤트 핸들러 (onClick 등) → 필수 추가
- 서버 fetch, 정적 렌더링만 → 추가하지 않음

### 데이터 페칭 판단
- 초기 페이지 로드 데이터, SEO 필요 → 서버 컴포넌트 fetch()
- 사용자 상호작용 후 데이터, 실시간 업데이트 → TanStack Query

---

## Prohibited Actions

- **`components/ui/` 파일 직접 수정** — shadcn/ui가 덮어쓸 수 있음
- **라우트 문자열 하드코딩** — `ROUTES` 상수 사용 필수
- **매직넘버 직접 사용** — 상수로 정의 후 사용
- **세미콜론 사용** — 코드 스타일 위반
- **`"use client"` 불필요한 추가** — 서버 컴포넌트 우선 원칙 위반
- **새 shadcn/ui 컴포넌트를 수동으로 components/ui/에 직접 생성** — CLI 명령어 사용 필수
- **공유 타입을 컴포넌트 파일 내부에 정의** — `types/index.ts`에 선언
- **클라이언트 데이터 페칭에 useEffect + fetch 직접 사용** — TanStack Query 사용
- **`picsum.photos` 외 승인되지 않은 외부 이미지 도메인 사용** — next.config.ts 등록 필수
