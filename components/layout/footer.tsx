// Footer: 저작권 및 링크를 포함하는 사이트 푸터
import { Container } from "./container"
import { SITE_CONFIG } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full border-t border-border/40">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            © {currentYear} {SITE_CONFIG.name}
          </p>
          <p className="text-xs text-muted-foreground/50">
            Built with Next.js & Notion
          </p>
        </div>
      </Container>
    </footer>
  )
}
