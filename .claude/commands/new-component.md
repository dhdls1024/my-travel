---
description: '프로젝트 패턴에 맞는 컴포넌트 스캐폴딩을 자동화합니다'
allowed-tools:
  [
    'Write',
    'Read',
    'Edit',
  ]
---

# Claude 명령어: New Component

`components/` 하위에 프로젝트 패턴에 맞는 새 컴포넌트를 생성합니다.

## 사용법

```
/new-component
```

실행 후 컴포넌트명과 카테고리를 입력하라는 안내가 나타납니다.

## 프로세스

1. **컴포넌트 정보 입력 받기**
   - 컴포넌트명 (PascalCase, 예: `UserCard`)
   - 카테고리 선택:
     - `common` — 전역 공통 컴포넌트 (ThemeToggle, BackButton 등)
     - `sections` — 페이지 섹션 컴포넌트 (HeroSection 등)
     - `examples` — 예제 페이지 전용 데모 컴포넌트
   - 인터랙션(useState, onClick 등) 필요 여부
   - 사용할 Props 타입: `ClassNameProps` | `ChildrenProps` | `둘 다` | `직접 정의`

2. **파일 생성**
   - `components/[category]/[Name].tsx` 생성
   - `cn()` import 포함
   - 프로젝트 공유 타입 적용 (`types/index.ts`)
   - 다크모드 대응 Tailwind 클래스 구조 포함

3. **30줄 초과 경고**
   - 생성된 컴포넌트가 30줄을 초과하면 분리 방법을 제안합니다

## 생성되는 파일 구조

### 기본 (서버 컴포넌트 + ClassNameProps)
```tsx
import { cn } from "@/lib/utils"
import { ClassNameProps } from "@/types"

// [컴포넌트명] 컴포넌트
interface [Name]Props extends ClassNameProps {
  // 추가 props 정의
}

export function [Name]({ className }: [Name]Props) {
  return (
    <div className={cn(
      // 기본 스타일 (라이트/다크 모드 대응)
      "bg-background text-foreground",
      className
    )}>
      {/* 컴포넌트 내용 */}
    </div>
  )
}
```

### 클라이언트 컴포넌트 (인터랙션 있음)
```tsx
"use client"

import { cn } from "@/lib/utils"
import { ClassNameProps } from "@/types"

// 클라이언트 인터랙션이 필요한 경우 "use client" 추가
interface [Name]Props extends ClassNameProps {
  // 추가 props 정의
}

export function [Name]({ className }: [Name]Props) {
  return (
    <div className={cn(
      "bg-background text-foreground",
      className
    )}>
      {/* 인터랙티브 컴포넌트 내용 */}
    </div>
  )
}
```

### ChildrenProps 사용 시
```tsx
import { cn } from "@/lib/utils"
import { ChildrenProps, ClassNameProps } from "@/types"

interface [Name]Props extends ChildrenProps, ClassNameProps {}

export function [Name]({ children, className }: [Name]Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}
```

## 규칙

- 컴포넌트명은 PascalCase, 파일명도 PascalCase (예: `UserCard.tsx`)
- 기본은 서버 컴포넌트 — 인터랙션 필요할 때만 `"use client"` 추가
- 조건부 클래스 병합은 항상 `cn()` 사용 (`lib/utils.ts`)
- Props 타입은 `types/index.ts`의 공유 타입 우선 활용
- 다크모드 대응: `bg-background`, `text-foreground` 등 CSS 변수 기반 클래스 사용
- **함수는 30줄 이하로 유지** — 초과 시 서브 컴포넌트 분리 제안
- 매직 스트링/넘버 금지 — 상수는 `lib/constants.ts`에 정의
