"use client"

import { useState } from "react"
// useMediaQuery: usehooks-ts의 미디어 쿼리 감지 훅
import { useMediaQuery } from "usehooks-ts"
// Sheet: shadcn의 슬라이드 드로어 컴포넌트 (모바일 메뉴에 적합)
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants"
import Link from "next/link"

// 모바일 breakpoint 상수
const MOBILE_BREAKPOINT = "(max-width: 768px)"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  // initializeWithValue: false → SSR/클라이언트 초기값을 false로 통일해 하이드레이션 불일치 방지
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, { initializeWithValue: false })

  // 데스크탑에서는 렌더링 자체를 생략 (SSR에서는 항상 렌더링)
  if (!isMobile) return null

  const handleNavClick = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="메뉴 열기" className="rounded-lg">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          {/* 앱 이름 — Playfair Display 이탤릭 */}
          <SheetTitle
            className="text-left text-base italic"
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
          >
            {SITE_CONFIG.name}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // external 링크는 새 탭으로 열기
              target={"external" in item && item.external ? "_blank" : undefined}
              rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
              onClick={handleNavClick}
              className="rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-foreground text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
