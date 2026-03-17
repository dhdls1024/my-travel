# 커스텀 커맨드 3개 생성 계획

## Context
이 스타터킷의 반복 작업(페이지 생성, 컴포넌트 생성, 코드 품질 점검)을 자동화하기 위해
`.claude/commands/` 폴더에 커스텀 커맨드 3개를 순차적으로 생성한다.
기존 `git/commit.md` 파일 형식(frontmatter + 마크다운)을 그대로 따른다.

---

## 커맨드 1: `/new-page`

**파일 경로**: `.claude/commands/new-page.md`

**역할**: 새 예제 페이지 스캐폴딩 자동화

**프로세스**:
1. 페이지명 입력받기 (예: `my-feature`)
2. `app/examples/[name]/page.tsx` 생성
   - `PageHeader` + `Container` + `section` 기본 구조 포함
   - 인터랙션 필요 여부에 따라 `"use client"` 추가 여부 안내
3. `lib/constants.ts`의 `COMPONENT_CARDS`에 항목 추가 안내
4. `types/index.ts`의 `ComponentCardTag` union에 필요한 태그 추가 안내

**allowed-tools**: `Bash(mkdir:*)`, `Write`, `Read`, `Edit`

---

## 커맨드 2: `/new-component`

**파일 경로**: `.claude/commands/new-component.md`

**역할**: 프로젝트 패턴에 맞는 컴포넌트 스캐폴딩

**프로세스**:
1. 컴포넌트명과 카테고리 입력받기 (예: `UserCard`, 카테고리: `common` | `examples` | `sections`)
2. `components/[category]/[Name].tsx` 생성
   - `cn()` import (`lib/utils.ts`)
   - `ClassNameProps` 또는 `ChildrenProps` 타입 적용 (`types/index.ts`)
   - 다크모드 대응 Tailwind 클래스 구조 포함
   - 인터랙션 필요 시 `"use client"` 추가
3. 30줄 초과 시 분리 제안

**allowed-tools**: `Write`, `Read`, `Edit`

---

## 커맨드 3: `/audit`

**파일 경로**: `.claude/commands/audit.md`

**역할**: 프로젝트 코드 품질 점검 리포트 출력

**프로세스**:
1. 하드코딩된 매직넘버/문자열 탐지 (`lib/constants.ts` 미사용)
2. 30줄 초과 함수 목록 출력
3. 불필요한 `"use client"` 탐지 (인터랙션 없는 컴포넌트)
4. `cn()` 미사용 조건부 클래스 탐지
5. 결과를 카테고리별로 정리해서 출력

**allowed-tools**: `Bash(find:*)`, `Glob`, `Grep`, `Read`

---

## 진행 순서

1. `/new-page` 커맨드 파일 생성 → 사용자 테스트
2. `/new-component` 커맨드 파일 생성 → 사용자 테스트
3. `/audit` 커맨드 파일 생성 → 사용자 테스트

## 파일 형식 참고

기존 `.claude/commands/git/commit.md` 형식:
```
---
description: '...'
allowed-tools:
  [
    'Bash(git add:*)',
    ...
  ]
---

# Claude 명령어: ...
(마크다운 문서)
```
