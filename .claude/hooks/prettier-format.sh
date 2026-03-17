#!/bin/bash
# PostToolUse(Edit|Write) 후 자동 Prettier 실행
# 파일 저장 시마다 코드 스타일을 자동으로 통일

set -euo pipefail

INPUT=$(cat)

# stdin JSON에서 수정된 파일 경로 추출
FILE_PATH=$(echo "$INPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const o=JSON.parse(d);
    process.stdout.write(o.tool_input?.file_path||'');
  })
")

# 포매팅 대상 확장자만 처리 (ts, tsx, js, jsx, json, css)
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx|json|css)$'; then
  cd "$CWD"
  npx prettier --write "$FILE_PATH" 2>/dev/null || true
fi

exit 0
