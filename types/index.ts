// 네비게이션 아이템 타입
export interface NavItem {
  label: string
  href: string
  external?: boolean
}

// 기술 스택 아이템 타입
export interface TechStackItem {
  name: string
  description: string
  version: string
  href: string
}

// 테마 타입
export type Theme = "light" | "dark" | "system"

// 공통 컴포넌트 props 타입
export interface ClassNameProps {
  className?: string
}

export interface ChildrenProps {
  children: React.ReactNode
}
