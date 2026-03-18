// Hero 섹션: 여행 플래너 홈 소개 (서버 컴포넌트)
// 풀스크린 레이아웃으로 헤드라인, 특징 3가지, CTA 버튼을 중앙 정렬
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { SITE_CONFIG, ROUTES } from "@/lib/constants"
import { MapPin, Map, CalendarDays } from "lucide-react"
import Link from "next/link"

// 주요 특징 목록: 아이콘 + 제목 + 설명으로 구성
const FEATURES = [
  {
    icon: MapPin,
    title: "장소 관리",
    description: "교통·숙소·맛집·명소를 카테고리별로 정리",
  },
  {
    icon: Map,
    title: "지도 시각화",
    description: "카카오 지도로 여행 동선을 한눈에 파악",
  },
  {
    icon: CalendarDays,
    title: "날짜별 필터",
    description: "방문 날짜 기준으로 일정 즉시 조회",
  },
] as const

export function HeroSection() {
  return (
    // 헤더 높이(4rem)를 제외한 전체 화면 높이를 채움
    <section className="flex min-h-[calc(100vh-4rem)] items-center py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-8 text-center">
          {/* 상단 뱃지: 프로젝트 성격 표시 */}
          <Badge variant="secondary" className="px-4 py-1 text-sm">
            개인 여행 플래너
          </Badge>

          {/* 메인 헤드라인 */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {SITE_CONFIG.name}
          </h1>

          {/* 서브 설명 */}
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {SITE_CONFIG.description}. Notion에 흩어진 여행 계획을 하나의
            대시보드에서 즉시 확인하세요.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={ROUTES.travel.root}>여행 플래너 시작하기</Link>
            </Button>
          </div>

          {/* 구분선 */}
          <div className="w-full max-w-xs border-t border-border sm:max-w-sm" />

          {/* 주요 특징 3가지: 아이콘 + 제목 + 설명 가로 나열 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm"
              >
                {/* 특징 아이콘 */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                {/* 특징 제목 */}
                <p className="font-semibold text-foreground">{title}</p>
                {/* 특징 설명 */}
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
