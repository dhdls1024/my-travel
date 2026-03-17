// On-demand ISR Revalidation API 핸들러
// Notion Webhook 등 외부 트리거가 이 엔드포인트를 호출하면
// 해당 경로의 캐시를 즉시 무효화 (revalidatePath/revalidateTag)
import { NextRequest } from "next/server"

// POST /api/revalidate
// Body: { secret: string, path?: string }
export async function POST(request: NextRequest) {
  // TODO: 요청 본문에서 secret 추출 후 환경변수(REVALIDATE_SECRET)와 비교
  // const body = await request.json()
  // if (body.secret !== process.env.REVALIDATE_SECRET) {
  //   return Response.json({ error: "Invalid secret" }, { status: 401 })
  // }

  // TODO: revalidatePath("/travel") 또는 revalidateTag("trips") 호출
  // import { revalidatePath } from "next/cache"
  // revalidatePath("/travel")

  return Response.json({ revalidated: false, message: "TODO: 구현 예정" })
}
