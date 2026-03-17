"use client"

// useRouter: 클라이언트 사이드 라우팅 훅
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

// 뒤로가기 버튼 — 브라우저 히스토리 기반으로 이전 페이지로 이동
export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="gap-1 text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      뒤로가기
    </Button>
  )
}
