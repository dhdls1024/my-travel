"use client"

// QueryClient: TanStack Query의 캐시와 설정을 관리하는 핵심 클라이언트
// QueryClientProvider: React 트리에 QueryClient를 주입하는 컨텍스트 Provider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// ReactQueryDevtools: 개발 환경에서 캐시 상태를 시각화하는 개발 도구
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

// QueryProvider: 앱 전체에 TanStack Query 컨텍스트를 제공하는 클라이언트 컴포넌트
// — QueryClient는 컴포넌트 외부가 아닌 useState로 생성해야 컴포넌트당 인스턴스를 보장함
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState로 생성: SSR 환경에서 요청마다 새 인스턴스를 만들어 캐시 공유를 방지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime: 데이터가 "신선"하다고 간주하는 시간 (ms). 이 시간 동안 리패칭 안 함
            staleTime: 60 * 1000, // 1분
            // retry: 요청 실패 시 재시도 횟수
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQueryDevtools: 개발 환경에서만 표시 (process.env.NODE_ENV 기반 자동 처리) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
