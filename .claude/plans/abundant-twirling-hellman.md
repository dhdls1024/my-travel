# Hook 3가지 테스트 플랜

## Context

구현된 3개 hook 스크립트를 실제 동작 검증한다.
탐색 결과 2가지 문제가 발견되어 수정 후 테스트 진행 필요:
1. `prettier` 미설치 (package.json에 없음)
2. `block-dangerous.sh`의 JSON 출력 시 bash `$PATTERN` 변수가 Node.js 문자열에 그대로 삽입되어 JSON 문법 오류 가능성

---

## 문제 및 수정 계획

### 문제 1: prettier 미설치
- **증상**: `npx prettier` 실행 시 설치 없이 자동 다운로드 or 404 오류
- **해결**: `npm install --save-dev prettier` 후 테스트

### 문제 2: block-dangerous.sh JSON escape 버그
- **현재 코드**:
  ```bash
  permissionDecisionReason: '위험한 명령어가 감지되어 차단되었습니다: $PATTERN'
  ```
  `$PATTERN` 값에 `/` 등이 포함될 경우 Node.js 문자열이 JSON으로 파싱될 때 문제 없음.
  하지만 패턴 값이 shell에서 보간되어 따옴표(`"`)가 포함되면 JSON 파싱 오류 발생.

- **해결**: 환경변수로 전달하거나 Node.js에서 `process.env`로 읽는 방식으로 수정:
  ```bash
  BLOCKED_PATTERN="$PATTERN" node -e "
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: '위험한 명령어가 감지되어 차단되었습니다: ' + process.env.BLOCKED_PATTERN
    }
  }))
  "
  ```

---

## 테스트 실행 순서

### 1단계: prettier 설치
```bash
npm install --save-dev prettier
```

### 2단계: block-dangerous.sh JSON 버그 수정
- 파일: `.claude/hooks/block-dangerous.sh`
- 35~43번 줄의 node 호출 부분을 환경변수 방식으로 수정

### 3단계: 각 hook 단위 테스트 (bash 직접 실행)

**session-context.sh 테스트:**
```bash
# startup 소스 → git 상태 출력 확인
echo '{"source":"startup"}' | CWD="$(pwd)" bash .claude/hooks/session-context.sh

# resume 소스 → 출력 없음 확인
echo '{"source":"resume"}' | CWD="$(pwd)" bash .claude/hooks/session-context.sh
```

**prettier-format.sh 테스트:**
```bash
# .ts 파일 포매팅 확인
echo '{"tool_input":{"file_path":"tsconfig.json"}}' | CWD="$(pwd)" bash .claude/hooks/prettier-format.sh

# 대상 외 파일 (.sh) → 포매팅 스킵 확인
echo '{"tool_input":{"file_path":"test.sh"}}' | CWD="$(pwd)" bash .claude/hooks/prettier-format.sh
```

**block-dangerous.sh 테스트:**
```bash
# 위험 명령어 → deny JSON 출력 확인
echo '{"tool_input":{"command":"rm -rf /"}}' | bash .claude/hooks/block-dangerous.sh

# 안전 명령어 → 출력 없음, exit 0 확인
echo '{"tool_input":{"command":"ls -la"}}' | bash .claude/hooks/block-dangerous.sh
```

### 4단계: 실제 Claude Code 동작 테스트
- **prettier**: 현 세션에서 `.ts` 파일 편집 후 자동 포매팅 확인
- **block-dangerous**: `rm -rf /` 명령 요청 시 차단 메시지 확인
- **session-context**: 다음 Claude Code 세션 시작 시 git 상태 컨텍스트 수신 확인

---

## 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | prettier devDependency 추가 |
| `.claude/hooks/block-dangerous.sh` | Node.js JSON 출력 시 환경변수 방식으로 수정 |

---

## 검증 기준

| Hook | 성공 조건 |
|------|-----------|
| `prettier-format.sh` | `.ts` 파일 편집 후 자동 포매팅 적용, exit 0 |
| `session-context.sh` | startup 시 git 브랜치/변경파일 출력, resume 시 출력 없음 |
| `block-dangerous.sh` | 위험 명령어 시 `permissionDecision: deny` JSON 출력, 안전 명령어 시 exit 0 |
