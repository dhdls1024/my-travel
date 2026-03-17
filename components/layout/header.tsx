// 서버 컴포넌트: ThemeToggle, MobileNav만 클라이언트 컴포넌트
import Link from "next/link"
import { Container } from "./container"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { MobileNav } from "./mobile-nav"
import { Separator } from "@/components/ui/separator"
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants"

export function Header() {
  return (
    // sticky: 스크롤 시 헤더 고정, backdrop-blur: 배경 블러 효과
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            {SITE_CONFIG.name}
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={"external" in item && item.external ? "_blank" : undefined}
                rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측: 테마 토글 + 모바일 메뉴 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* MobileNav: 내부에서 isMobile 체크 후 조건부 렌더링 */}
            <MobileNav />
          </div>
        </div>
      </Container>
      <Separator />
    </header>
  )
}
