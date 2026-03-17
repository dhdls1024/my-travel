# Plan: .mcp.json Windows cmd /c 래퍼 수정

## Context
Windows에서 `npx`를 직접 `command`로 사용하면 Claude Code가 경고를 발생시킴.
`playwright`는 이미 `cmd /c` 래퍼를 사용 중이므로, 나머지 두 서버도 동일하게 수정.

## 수정 대상 파일
- `.mcp.json`

## 변경 내용

### sequential-thinking
**Before:**
```json
"command": "npx",
"args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
```
**After:**
```json
"command": "cmd",
"args": ["/c", "npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
```

### shadcn
**Before:**
```json
"command": "npx",
"args": ["shadcn@latest", "mcp"]
```
**After:**
```json
"command": "cmd",
"args": ["/c", "npx", "shadcn@latest", "mcp"]
```

## 검증
- Claude Code 재시작 후 `.mcp.json` 관련 Warning이 사라지는지 확인
