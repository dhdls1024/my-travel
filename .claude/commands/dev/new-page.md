---
description: '새 예제 페이지 스캐폴딩을 자동화합니다 (app/examples/[name]/page.tsx 생성)'
allowed-tools:
  [
    'Bash(mkdir:*)',
    'Write',
    'Read',
    'Edit',
  ]
---

# Claude 명령어: New Page

`app/examples/` 하위에 새로운 예제 페이지를 프로젝트 패턴에 맞게 자동으로 생성합니다.

## 사용법

```
/new-page
```

실행 후 페이지명을 입력하라는 안내가 나타납니다. (예: `my-feature`)

## 프로세스

1. **페이지명 입력 받기**
   - 사용자에게 페이지명을 물어봅니다 (kebab-case, 예: `my-feature`)
   - 인터랙션(useState, onClick 등) 필요 여부를 함께 확인합니다

2. **디렉토리 및 파일 생성**
   - `app/examples/[name]/` 폴더 생성
   - `app/examples/[name]/page.tsx` 파일 생성
   - `PageHeader` + `Container` + `section` 기본 구조 포함
   - 인터랙션 필요 시 상단에 `"use client"` 추가

3. **constants.ts 업데이트 안내**
   - `lib/constants.ts`의 `COMPONENT_CARDS` 배열에 항목 추가 안내
   - 추가할 코드 스니펫 제공

4. **types/index.ts 업데이트 안내**
   - `ComponentCardTag` union 타입에 새 태그가 필요하면 추가 안내

## 생성되는 파일 구조

### 서버 컴포넌트 (인터랙션 없음)
```tsx
import { PageHeader } from "@/components/common/PageHeader"
import { Container } from "@/components/layout/Container"

// [페이지명] 예제 페이지
export default function [PageName]Page() {
  return (
    <Container>
      <PageHeader
        title="[페이지 제목]"
        description="[페이지 설명]"
      />
      <section className="mt-8">
        {/* 콘텐츠 영역 */}
      </section>
    </Container>
  )
}
```

### 클라이언트 컴포넌트 (인터랙션 있음)
```tsx
"use client"

import { PageHeader } from "@/components/common/PageHeader"
import { Container } from "@/components/layout/Container"

// 클라이언트 인터랙션이 필요한 경우 "use client" 추가
export default function [PageName]Page() {
  return (
    <Container>
      <PageHeader
        title="[페이지 제목]"
        description="[페이지 설명]"
      />
      <section className="mt-8">
        {/* 인터랙티브 콘텐츠 영역 */}
      </section>
    </Container>
  )
}
```

## COMPONENT_CARDS 추가 예시

`lib/constants.ts`에 아래 형식으로 추가:
```ts
{
  title: "[페이지 제목]",
  description: "[페이지 설명]",
  href: "/examples/[name]",
  tag: "[태그]" as ComponentCardTag,
},
```

## 규칙

- 파일명은 항상 `page.tsx`
- 컴포넌트명은 PascalCase + `Page` 접미사 (예: `MyFeaturePage`)
- 기본은 서버 컴포넌트, 인터랙션이 있을 때만 `"use client"` 추가
- 하드코딩 금지 — 텍스트 상수는 `lib/constants.ts`에 정의
- `cn()` 유틸리티 사용: `import { cn } from "@/lib/utils"`
