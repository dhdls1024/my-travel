#!/bin/bash
# PreToolUse(Bash) 실행 전 위험한 명령어 차단
# rm -rf, git reset --hard, git push --force 등 복구 불가 명령어 사전 방지

set -euo pipefail

INPUT=$(cat)

# stdin JSON에서 실행 예정 명령어 추출
COMMAND=$(echo "$INPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const o=JSON.parse(d);
    process.stdout.write(o.tool_input?.command||'');
  })
")

# 차단할 위험 패턴 목록 정의
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf \*"
  "git reset --hard"
  "git push --force"
  "git push -f"
  "git clean -f"
  "DROP TABLE"
  "DROP DATABASE"
)

# 명령어에 위험 패턴이 포함되어 있는지 순차 검사
for PATTERN in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qF "$PATTERN"; then
    # permissionDecision: deny 응답을 JSON으로 출력하여 Claude에게 거부 신호 전달
    # 환경변수로 전달하여 PATTERN 값에 따옴표 등 특수문자가 있어도 JSON이 깨지지 않도록 함
    BLOCKED_PATTERN="$PATTERN" node -e "
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: '위험한 명령어가 감지되어 차단되었습니다: ' + process.env.BLOCKED_PATTERN
  }
}))
"
    exit 0
  fi
done

exit 0
