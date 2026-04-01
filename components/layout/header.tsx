// 서버 컴포넌트: ThemeToggle, MobileNav만 클라이언트 컴포넌트
import Link from "next/link"
import { Container } from "./container"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { MobileNav } from "./mobile-nav"
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants"
import { Plane } from "lucide-react"

export function Header() {
  return (
    // sticky: 스크롤 시 헤더 고정
    // backdrop-blur + bg 반투명: 글라스모피즘 효과 — 콘텐츠 위에 떠있는 느낌
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* 로고 — Playfair Display 이탤릭으로 여행 잡지 느낌 */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            {/* 로고 아이콘: Plane — OS 무관 일관된 렌더링, aria-hidden으로 스크린리더 읽기 방지 */}
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="h-4 w-4" aria-hidden="true" />
            </span>
            <span
              className="text-lg font-semibold tracking-tight italic"
              style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
            >
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={"external" in item && item.external ? "_blank" : undefined}
                rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측: 테마 토글 + 모바일 메뉴 */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {/* MobileNav: 내부에서 isMobile 체크 후 조건부 렌더링 */}
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  )
}
