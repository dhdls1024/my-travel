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
import { Menu } from "lucide-react"
import { NAV_ITEMS } from "@/lib/constants"
import Link from "next/link"

// 모바일 breakpoint 상수
const MOBILE_BREAKPOINT = "(max-width: 768px)"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  // initializeWithValue: false → SSR/클라이언트 초기값을 false로 통일해 하이드레이션 불일치 방지
  // useEffect 실행 후 실제 viewport 값으로 업데이트됨
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, { initializeWithValue: false })

  // 데스크탑에서는 렌더링 자체를 생략 (SSR에서는 항상 렌더링)
  if (!isMobile) return null

  const handleNavClick = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="메뉴 열기">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // external 링크는 새 탭으로 열기
              target={"external" in item && item.external ? "_blank" : undefined}
              rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
              onClick={handleNavClick}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
