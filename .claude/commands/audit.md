---
description: '프로젝트 코드 품질을 점검하고 카테고리별 리포트를 출력합니다'
allowed-tools:
  [
    'Bash(find:*)',
    'Glob',
    'Grep',
    'Read',
  ]
---

# Claude 명령어: Audit

프로젝트 전체 코드를 점검하여 품질 이슈를 카테고리별로 정리해서 출력합니다.

## 사용법

```
/audit
```

## 점검 항목

### 1. 하드코딩된 매직값 탐지
`lib/constants.ts`를 거치지 않고 컴포넌트에 직접 작성된 문자열/숫자를 탐지합니다.

**탐지 대상:**
- JSX 내 직접 작성된 URL 문자열 (`href="/..."`, `src="http..."`)
- 반복 사용되는 하드코딩 문자열 (제목, 설명 등)
- 매직 넘버 (px 제외, 의미 없는 숫자 리터럴)

**검사 범위:** `app/`, `components/` (단, `components/ui/` 제외)

---

### 2. 30줄 초과 함수/컴포넌트 탐지
함수 본문이 30줄을 초과하는 컴포넌트 또는 함수를 식별합니다.

**검사 범위:** `app/`, `components/` (단, `components/ui/` 제외)

**출력 형식:**
```
파일경로:시작줄 — 함수명 (약 N줄)
```

---

### 3. 불필요한 `"use client"` 탐지
`"use client"`가 선언되어 있지만 클라이언트 전용 API를 사용하지 않는 파일을 탐지합니다.

**클라이언트 전용 API 기준:**
- React hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useReducer`
- 이벤트 핸들러: `onClick`, `onChange`, `onSubmit`, `onKeyDown` 등
- 브라우저 API: `window`, `document`, `localStorage`
- 외부 훅: `useRouter`, `usePathname`, `useTheme` 등

**검사 범위:** `app/`, `components/` (단, `components/ui/` 제외)

---

### 4. `cn()` 미사용 조건부 클래스 탐지
`cn()` 없이 템플릿 리터럴이나 삼항 연산자로 조건부 클래스를 작성한 패턴을 탐지합니다.

**탐지 패턴:**
- `` className={`... ${condition ? ... : ...}`} ``
- `className={condition ? "..." : "..."}`
- 문자열 직접 연결: `className={"base " + variable}`

**검사 범위:** `app/`, `components/` (단, `components/ui/` 제외)

---

## 출력 형식

점검 완료 후 아래 형식으로 결과를 출력합니다:

```
## 🔍 코드 품질 감사 리포트

### ✅ / ⚠️ 1. 하드코딩된 매직값
[이슈 없음 또는 목록]

### ✅ / ⚠️ 2. 30줄 초과 함수
[이슈 없음 또는 목록]

### ✅ / ⚠️ 3. 불필요한 "use client"
[이슈 없음 또는 목록]

### ✅ / ⚠️ 4. cn() 미사용 조건부 클래스
[이슈 없음 또는 목록]

---
총 N개 이슈 발견 | 수정 우선순위: [높음/중간/낮음]
```

## 규칙

- `components/ui/`는 shadcn/ui 자동 생성 파일이므로 **검사에서 제외**
- 이슈 발견 시 파일 경로와 줄 번호를 함께 출력
- 각 이슈에 대해 간단한 수정 방법도 함께 제안
