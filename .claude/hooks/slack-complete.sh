#!/bin/bash
# Claude Code가 응답/작업 완료 시 Slack으로 알림 전송

set -euo pipefail

# stdin에서 JSON 데이터 읽기
INPUT=$(cat)

# Slack Webhook URL (환경변수로 관리 — shell profile에 SLACK_WEBHOOK_URL 설정)
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
if [ -z "$SLACK_WEBHOOK_URL" ]; then
  exit 0
fi

# node로 JSON 파싱 (한글 깨짐 방지)
CWD=$(echo "$INPUT" | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const o=JSON.parse(d); process.stdout.write(o.cwd||''); })")
PROJECT=$(basename "$CWD")

# node로 UTF-8 JSON 생성 후 curl에 전달
node -e "
const payload = {
  text: '✅ *Claude Code 작업 완료*',
  attachments: [{
    color: 'good',
    fields: [{ title: '프로젝트', value: '$PROJECT', short: true }]
  }]
}
process.stdout.write(JSON.stringify(payload))
" | curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-type: application/json; charset=utf-8' \
  -d @-

exit 0
