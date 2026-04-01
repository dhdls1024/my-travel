// Hero 섹션: 여행 플래너 홈 소개 (서버 컴포넌트)
// 풀스크린 그라디언트 배경 + 세리프 헤드라인 + 특징 카드
import { Container } from "@/components/layout/container"
import { SITE_CONFIG, ROUTES } from "@/lib/constants"
import { MapPin, Map, CalendarDays } from "lucide-react"
import Link from "next/link"

// 주요 특징 목록
const FEATURES = [
  {
    icon: MapPin,
    title: "장소 관리",
    description: "교통·숙소·맛집·명소를 카테고리별로 정리",
    color: "#3B82F6",
  },
  {
    icon: Map,
    title: "지도 시각화",
    description: "카카오 지도로 여행 동선을 한눈에 파악",
    color: "#22C55E",
  },
  {
    icon: CalendarDays,
    title: "날짜별 필터",
    description: "방문 날짜 기준으로 일정 즉시 조회",
    color: "#F97316",
  },
] as const

export function HeroSection() {
  return (
    // 풀스크린 히어로: 그라디언트 배경 + 중앙 정렬
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">

      {/* 배경 그라디언트 레이어 — 여행 무드의 따뜻한/쿨한 그라디언트 */}
      <div
        className="animate-gradient absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, oklch(0.95 0.04 260) 0%, oklch(0.97 0.02 200) 30%, oklch(0.98 0.03 80) 60%, oklch(0.96 0.04 40) 100%)",
          backgroundSize: "300% 300%",
        }}
        aria-hidden="true"
      />

      {/* 배경 장식 원형 블러 — 분위기 연출 */}
      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.6 0.15 260), transparent)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.12 40), transparent)" }}
        aria-hidden="true"
      />

      <Container>
        <div className="flex flex-col items-center gap-10 py-20 text-center">

          {/* 상단 레이블 */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            개인 여행 플래너
          </div>

          {/* 메인 헤드라인 — Playfair Display 세리프 */}
          <div className="animate-fade-up animate-delay-100 space-y-3">
            <h1
              className="max-w-3xl text-5xl font-bold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
            >
              <span className="block">{SITE_CONFIG.name}</span>
              {/* 라이트 모드: 깊은 인디고 계열 그라디언트 — 크림 배경 위에서 충분한 대비 확보 */}
              <span
                className="mt-1 block italic dark:hidden"
                style={{
                  background: "linear-gradient(135deg, oklch(0.35 0.12 255), oklch(0.55 0.1 200))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                나의 여행을 한눈에
              </span>
              {/* 다크 모드: 골드-앰버 계열 그라디언트 — 네이비 배경 위에서 WCAG AA 대비비 확보 */}
              <span
                className="mt-1 hidden italic dark:block"
                style={{
                  background: "linear-gradient(135deg, oklch(0.78 0.1 80), oklch(0.88 0.08 60))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                나의 여행을 한눈에
              </span>
            </h1>
          </div>

          {/* 서브 설명 */}
          <p className="animate-fade-up animate-delay-200 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Notion에 흩어진 여행 계획을{" "}
            <strong className="font-medium text-foreground">하나의 대시보드</strong>에서
            즉시 확인하세요. 교통, 숙소, 맛집, 명소를 카테고리별로 정리하고 지도로 시각화합니다.
          </p>

          {/* CTA 버튼 */}
          <div className="animate-fade-up animate-delay-300 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.travel.root}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              여행 플래너 시작하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* 구분 */}
          <div className="animate-fade-up animate-delay-400 flex items-center gap-4 text-xs text-muted-foreground/60">
            <span>Notion 연동</span>
            <span>·</span>
            <span>카카오 지도</span>
            <span>·</span>
            <span>PWA 지원</span>
          </div>

          {/* 특징 카드 3개 */}
          <div className="animate-fade-up animate-delay-400 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {/* 특징 아이콘 */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
                </div>
                {/* 특징 제목 */}
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {/* 특징 설명 */}
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  )
}
