// 홈 페이지: 여행 플래너 소개 (서버 컴포넌트)
import { HeroSection } from "@/components/sections/hero-section"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero: 여행 플래너 소개 및 CTA */}
      <HeroSection />
    </main>
  )
}
