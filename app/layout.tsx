import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
// cn: clsx + tailwind-merge 조건부 클래스 병합 유틸리티
import { cn } from "@/lib/utils"
// ThemeProvider: next-themes의 다크모드 Provider (SSR 안전)
import { ThemeProvider } from "next-themes"
// Toaster: sonner 기반 토스트 알림 컴포넌트
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
// QueryProvider: TanStack Query 캐시 컨텍스트 (클라이언트 컴포넌트)
import { QueryProvider } from "@/providers/query-provider"
// SpeedInsights: Vercel 성능 모니터링 — Core Web Vitals(LCP, FID, CLS) 수집
import { SpeedInsights } from "@vercel/speed-insights/next"
// Analytics: Vercel 방문자 분석 — 페이지뷰, 이탈률, 방문 경로 추적
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SITE_CONFIG } from "@/lib/constants"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: next-themes SSR 하이드레이션 불일치 경고 억제
    // (서버/클라이언트 테마 초기값 불일치는 의도된 동작)
    <html lang="ko" suppressHydrationWarning>
      <body
        className={cn(geistSans.variable, geistMono.variable, "flex min-h-screen flex-col antialiased")}
      >
        <ThemeProvider
          attribute="class"          // .dark 클래스로 CSS 변수 전환
          defaultTheme="system"      // OS 다크모드 설정을 기본값으로
          enableSystem               // 시스템 테마 감지 활성화
          disableTransitionOnChange  // 테마 전환 시 CSS transition 비활성화 (깜빡임 방지)
        >
          {/* QueryProvider: TanStack Query 캐시를 ThemeProvider 안에 배치해 테마 컨텍스트 접근 가능 */}
          <QueryProvider>
            <Header />
            {children}
            <Footer />
            {/* richColors: 알림 유형별 색상 자동 적용 */}
            <Toaster richColors />
            {/* Vercel 모니터링 — 프로덕션에서만 활성화됨 (로컬 개발 환경에서는 무동작) */}
            <SpeedInsights />
            <Analytics />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
