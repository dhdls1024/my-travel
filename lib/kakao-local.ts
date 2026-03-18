// !! 서버 사이드 전용 모듈 !!
// 카카오 로컬 REST API는 서버에서만 호출합니다.
// KAKAO_REST_API_KEY가 브라우저에 노출되지 않도록 NEXT_PUBLIC_ 접두사를 붙이지 않습니다.

// ─── 상수 ────────────────────────────────────────────────────────────────────

// 카카오 로컬 키워드 검색 엔드포인트
const KAKAO_LOCAL_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"

// 카카오 로컬 주소 검색 엔드포인트 — 지번/도로명 주소 → 위경도 변환
const KAKAO_ADDRESS_API_URL = "https://dapi.kakao.com/v2/local/search/address.json"

// 검색 결과 최대 개수 — 첫 번째 결과만 사용하므로 1로 고정
const KAKAO_SEARCH_SIZE = 1

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

/**
 * 카카오 로컬 API 검색 결과 단일 문서 타입
 * x = 경도(longitude), y = 위도(latitude) — 순서 주의!
 */
interface KakaoLocalDocument {
  x: string // 경도 (longitude)
  y: string // 위도 (latitude)
  place_name: string
}

/**
 * 카카오 로컬 API 응답 타입
 */
interface KakaoLocalResponse {
  documents: KakaoLocalDocument[]
}

/**
 * 카카오 주소 검색 API 결과 단일 문서 타입
 * x = 경도(longitude), y = 위도(latitude) — 순서 주의!
 */
interface KakaoAddressDocument {
  x: string // 경도 (longitude)
  y: string // 위도 (latitude)
}

/**
 * 카카오 주소 검색 API 응답 타입
 */
interface KakaoAddressResponse {
  documents: KakaoAddressDocument[]
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * 카카오 로컬 키워드 검색 API로 장소명에 해당하는 위경도를 조회한다.
 *
 * - 환경변수 KAKAO_REST_API_KEY 없으면 null 반환 (graceful degradation)
 * - 검색 결과 없으면 null 반환
 * - API 에러 시 null 반환 (지도 기능이 전체 페이지를 망가뜨리지 않도록)
 *
 * 주의: 카카오 API 응답에서 x = 경도(lng), y = 위도(lat) 순서임
 *
 * @param placeName - 검색할 장소명
 * @returns { lat, lng } 객체 또는 null
 */
export async function searchPlaceCoords(
  placeName: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY

  // API 키가 없으면 조용히 종료 — 설정 전 개발 환경에서도 앱이 동작하도록
  if (!apiKey) return null

  try {
    const url = `${KAKAO_LOCAL_API_URL}?query=${encodeURIComponent(placeName)}&size=${KAKAO_SEARCH_SIZE}`

    // AbortController로 5초 타임아웃 설정 — API 무응답 시 무한 대기 방지
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
      // Next.js fetch 캐시 설정 — 같은 장소명 반복 호출 시 캐시 활용
      next: { revalidate: 3600 },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null

    const data: KakaoLocalResponse = await res.json()
    const first = data.documents[0]

    // 검색 결과 없으면 null
    if (!first) return null

    // x = 경도(longitude), y = 위도(latitude) — 카카오 API 특성상 순서 반전
    return {
      lat: parseFloat(first.y),
      lng: parseFloat(first.x),
    }
  } catch {
    // 네트워크 오류 등 예외 발생 시 null 반환 — 지도 기능이 페이지 전체를 깨뜨리면 안 됨
    return null
  }
}

/**
 * 카카오 로컬 주소 검색 API로 지번/도로명 주소에 해당하는 위경도를 조회한다.
 *
 * searchPlaceCoords()와 달리 이 함수는 "장소명 검색"이 아닌 "주소 → 좌표 변환"에 사용한다.
 * 투어버스 정류장처럼 Notion DB에 지번 주소가 저장된 경우에 적합하다.
 *
 * - 환경변수 KAKAO_REST_API_KEY 없으면 null 반환
 * - 검색 결과 없으면 null 반환
 * - API 에러 시 null 반환
 *
 * @param address - 검색할 지번 또는 도로명 주소
 * @returns { lat, lng } 객체 또는 null
 */
export async function searchAddressCoords(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY
  if (!apiKey) return null

  try {
    const url = `${KAKAO_ADDRESS_API_URL}?query=${encodeURIComponent(address)}&size=1`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      // 주소는 잘 바뀌지 않으므로 1시간 캐시 적용
      next: { revalidate: 3600 },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null

    const data: KakaoAddressResponse = await res.json()
    const first = data.documents[0]
    if (!first) return null

    // x = 경도(longitude), y = 위도(latitude) — 카카오 API 특성상 순서 반전
    return {
      lat: parseFloat(first.y),
      lng: parseFloat(first.x),
    }
  } catch {
    return null
  }
}
