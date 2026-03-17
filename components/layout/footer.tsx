// Footer: 저작권 및 링크를 포함하는 사이트 푸터
import { Container } from "./container"
import { Separator } from "@/components/ui/separator"
import { SITE_CONFIG } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full">
      <Separator />
      <Container>
        <div className="flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js & shadcn/ui
          </p>
        </div>
      </Container>
    </footer>
  )
}
