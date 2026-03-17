"use client"

// cn: clsx + tailwind-merge 조건부 클래스 병합 유틸리티
import { cn } from "@/lib/utils"
// useState, useEffect: 마운트 상태 추적으로 Hydration 오류 방지
import { useState, useEffect } from "react"
// useTheme: next-themes에서 현재 테마 조회 및 변경 훅
import { useTheme } from "next-themes"
// DropdownMenu: shadcn UI의 드롭다운 메뉴 컴포넌트
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"
import type { Theme } from "@/types"

// 테마 옵션 상수 (매직 스트링 방지)
const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] =
  [
    { value: "light", label: "라이트", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "다크", icon: <Moon className="h-4 w-4" /> },
    {
      value: "system",
      label: "시스템",
      icon: <Monitor className="h-4 w-4" />,
    },
  ]

export function ThemeToggle() {
  // next-themes의 useTheme()을 직접 사용 (커스텀 훅 래핑 없음 - 단순 위임은 추상화 불필요)
  const { theme, setTheme } = useTheme()
  // mounted: useEffect 실행 후 true → SSR과 클라이언트 초기값 일치 보장
  // SSR 시 theme = undefined이지만, 클라이언트는 localStorage에서 실제 테마를 읽어
  // 아이콘이 달라지는 Hydration 불일치를 방지하기 위해 마운트 전 고정 플레이스홀더 렌더
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 마운트 전: 서버 렌더와 동일한 고정 플레이스홀더 반환 (hydration 일치)
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 전환" disabled>
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }

  // 현재 테마에 맞는 아이콘 표시
  const currentIcon =
    THEME_OPTIONS.find((t) => t.value === theme)?.icon ?? (
      <Monitor className="h-4 w-4" />
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* variant ghost: 배경 없이 아이콘만 표시 */}
        <Button variant="ghost" size="icon" aria-label="테마 전환">
          {currentIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, label, icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            // 현재 선택된 테마 강조 — cn()으로 조건부 클래스 병합
            className={cn(theme === value && "bg-accent")}
          >
            <span className="mr-2">{icon}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
