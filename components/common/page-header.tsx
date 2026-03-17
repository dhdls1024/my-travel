// 예제 페이지 공통 헤더 — 타이틀, 설명, 태그, 뒤로가기 버튼을 포함하는 서버 컴포넌트
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/common/back-button"
import { Container } from "@/components/layout/container"

interface PageHeaderProps {
  title: string
  description: string
  tags?: string[]
}

export function PageHeader({ title, description, tags = [] }: PageHeaderProps) {
  return (
    <section className="border-b bg-muted/30 py-10">
      <Container>
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="flex flex-col gap-4">
          {/* 태그 뱃지 목록 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 페이지 제목 */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>

          {/* 페이지 설명 */}
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        </div>
      </Container>
    </section>
  )
}
