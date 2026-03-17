// 최대 너비 + 반응형 패딩을 제공하는 래퍼 컴포넌트
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

// 모든 섹션에서 일관된 너비/패딩을 유지하기 위해 별도 컴포넌트로 분리
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  )
}
