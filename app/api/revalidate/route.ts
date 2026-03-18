// On-demand ISR Revalidation API 핸들러
// 새로고침 버튼 클릭 시 이 엔드포인트를 호출하여 캐시를 즉시 무효화
import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"

// POST /api/revalidate
// Body: { tripId: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId } = body

    // 여행 목록 페이지 캐시 무효화
    revalidatePath("/travel")

    // 특정 여행 대시보드 페이지 캐시 무효화
    if (tripId) {
      revalidatePath(`/travel/${tripId}`)
      revalidatePath(`/travel/${tripId}/map`)
    }

    return Response.json({ revalidated: true })
  } catch {
    // 요청 파싱 실패 등 예외 처리
    return Response.json(
      { revalidated: false, error: "재검증 실패" },
      { status: 500 }
    )
  }
}
