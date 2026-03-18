"use client"

// 여행 목록 페이지 에러 바운더리 — 클라이언트 컴포넌트 필수
// Notion API 호출 실패 등 TripList 렌더링 중 발생하는 에러를 잡아서 표시
// Next.js App Router는 error.tsx를 자동으로 Suspense 에러 경계로 사용
import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  // reset: Next.js가 주입하는 재시도 함수 — 세그먼트를 다시 렌더링 시도
  reset: () => void
}

export default function TravelListError({ error, reset }: ErrorProps) {
  // 에러 발생 시 콘솔에 로깅 — 운영 환경에서 디버깅 용도
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <p className="text-lg font-medium text-destructive">
        여행 목록을 불러오지 못했어요.
      </p>
      <p className="text-sm text-muted-foreground">
        Notion 연결에 문제가 생겼을 수 있습니다. 잠시 후 다시 시도해 주세요.
      </p>
      {/* reset 호출 시 Next.js가 TripList 서버 컴포넌트를 재요청 */}
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        다시 시도
      </button>
    </div>
  )
}
