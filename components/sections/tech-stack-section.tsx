// 기술 스택 섹션: 여행 플래너에 사용된 기술 카드 그리드 (서버 컴포넌트)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { TECH_STACK } from "@/lib/constants"

export function TechStackSection() {
  return (
    <section id="tech-stack" className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-col gap-8">
          {/* 섹션 헤더 */}
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">기술 스택</h2>
            <p className="mt-2 text-muted-foreground">
              여행 플래너를 구성하는 핵심 기술들
            </p>
          </div>

          {/* 기술 스택 카드 그리드 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((tech) => (
              <a
                key={tech.name}
                href={tech.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{tech.name}</CardTitle>
                      {/* 버전 뱃지 */}
                      <Badge variant="secondary" className="text-xs">
                        {tech.version}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{tech.description}</CardDescription>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
