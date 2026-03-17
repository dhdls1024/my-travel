// Hero 섹션: 여행 플래너 홈 소개 (서버 컴포넌트)
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { SITE_CONFIG, ROUTES } from "@/lib/constants"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-col items-center gap-6 text-center">
          {/* 상단 뱃지: 프로젝트 성격 표시 */}
          <Badge variant="secondary" className="text-sm">
            개인 여행 플래너
          </Badge>

          {/* 메인 헤드라인 */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {SITE_CONFIG.name}
          </h1>

          {/* 서브 설명 */}
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {SITE_CONFIG.description}. 교통·숙소·맛집·명소를 카테고리별로 즉시 필터링하고 지도로 동선을 파악하세요.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={ROUTES.travel.root}>여행 플래너 시작하기</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
