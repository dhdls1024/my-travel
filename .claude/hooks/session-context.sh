#!/bin/bash
# SessionStart 시 git 상태를 Claude 컨텍스트로 주입
# 세션 시작 시 브랜치, 변경 파일, 최근 커밋을 자동으로 보고

set -euo pipefail

INPUT=$(cat)

# 세션 시작 소스 확인 (startup만 실행, resume/compact 제외)
SOURCE=$(echo "$INPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const o=JSON.parse(d);
    process.stdout.write(o.source||'');
  })
")

# startup이 아닌 경우 스킵
if [ "$SOURCE" != "startup" ]; then
  exit 0
fi

cd "$CWD"

# git 저장소인지 확인
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  exit 0
fi

# Claude에게 컨텍스트로 주입될 stdout 출력
echo "=== 현재 Git 상태 ==="
echo "브랜치: $(git branch --show-current)"
echo ""
echo "변경된 파일:"
git status --short 2>/dev/null || echo "(없음)"
echo ""
echo "최근 커밋 3개:"
git log --oneline -3 2>/dev/null || echo "(없음)"

exit 0
