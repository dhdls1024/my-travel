"use client"

// RefreshButton: On-demand ISR 재검증 트리거 + 라우터 새로고침 버튼 컴포넌트
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
  // 재검증 대상 여행 ID
  tripId: string
}

// /api/revalidate 엔드포인트를 POST 호출해 캐시를 무효화하고 라우터를 새로고침
export function RefreshButton({ tripId }: RefreshButtonProps) {
  // 로딩 상태 관리 — 버튼 비활성화 및 스피너 표시에 사용
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 새로고침 버튼 클릭 핸들러
  // 1. ISR revalidate API 호출 → 2. 성공 시 router.refresh() → 3. 결과 토스트 알림
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      })

      if (res.ok) {
        // 서버 캐시 무효화 후 클라이언트 라우터 캐시도 갱신
        router.refresh()
        toast.success("데이터를 새로고침했습니다")
      } else {
        toast.error("새로고침에 실패했습니다")
      }
    } catch {
      // 네트워크 오류 등 예외 발생 시
      toast.error("새로고침에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      aria-label="데이터 새로고침"
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5",
        "text-sm text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        // 로딩 중 비활성화 스타일
        isLoading && "cursor-not-allowed opacity-50"
      )}
    >
      {/* 로딩 중일 때 아이콘 회전 애니메이션 적용 */}
      <RefreshCw
        className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
        aria-hidden="true"
      />
      {/* 모바일에서는 텍스트 숨김, sm 이상에서만 표시 */}
      <span className="hidden sm:inline">새로고침</span>
    </button>
  )
}
