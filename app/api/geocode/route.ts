import { NextRequest, NextResponse } from "next/server"

// 카카오 로컬 키워드 검색 API 응답 타입
interface KakaoDocument {
  x: string // 경도 (longitude)
  y: string // 위도 (latitude)
}

interface KakaoKeywordResponse {
  documents: KakaoDocument[]
}

/**
 * GET /api/geocode?q=장소명
 * 장소명을 카카오 로컬 키워드 검색 API로 조회해 위경도를 반환하는 프록시 핸들러.
 * KAKAO_REST_API_KEY를 서버에서만 사용해 클라이언트 키 노출을 방지한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get("q")

  // q 파라미터가 없으면 400 반환
  if (!query) {
    return NextResponse.json({ error: "q 파라미터가 필요합니다" }, { status: 400 })
  }

  const apiKey = process.env.KAKAO_REST_API_KEY

  // 환경변수가 설정되지 않으면 서버 설정 오류로 500 반환
  if (!apiKey) {
    return NextResponse.json(
      { error: "카카오 API 키가 설정되지 않았습니다" },
      { status: 500 }
    )
  }

  try {
    const kakaoUrl = new URL("https://dapi.kakao.com/v2/local/search/keyword.json")
    kakaoUrl.searchParams.set("query", query)
    kakaoUrl.searchParams.set("size", "1") // 첫 번째 결과만 사용

    const response = await fetch(kakaoUrl.toString(), {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
      // 동일 장소명 반복 요청에 대한 성능 개선을 위해 60초 캐시 적용
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "카카오 API 호출에 실패했습니다" },
        { status: 500 }
      )
    }

    const data: KakaoKeywordResponse = await response.json()

    // 검색 결과가 없으면 404 반환
    if (data.documents.length === 0) {
      return NextResponse.json(
        { error: "장소를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const { x, y } = data.documents[0]

    return NextResponse.json({
      lat: parseFloat(y), // y가 위도
      lng: parseFloat(x), // x가 경도
    })
  } catch {
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
