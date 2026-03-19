// Service Worker — next-pwa 미사용 (Turbopack 비호환), 수동 작성
// 캐싱 전략: 정적 자산 Cache-first / HTML 페이지 Network-first / API·카카오 NetworkOnly

const STATIC_CACHE = "static-v1"
const PAGES_CACHE = "pages-v1"

// install — 정적 자산 프리캐시
self.addEventListener("install", (event) => {
  // skipWaiting: 새 SW가 즉시 활성화되도록 대기 건너뜀
  // 기존 SW가 활성 중이어도 새 버전이 바로 제어권을 가져감
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["/", "/offline", "/icons/icon-192.png", "/icons/icon-512.png"])
    )
  )
})

// activate — 구버전 캐시 정리
self.addEventListener("activate", (event) => {
  // clients.claim: 현재 열린 탭을 새 SW가 즉시 제어
  // 페이지 새로고침 없이도 새 SW가 fetch 이벤트를 가로챌 수 있음
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k))
        )
      ),
    ])
  )
})

// fetch — URL 패턴별 캐싱 전략 분기
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // NetworkOnly: API 요청 — On-demand ISR 새로고침 버튼이 항상 최신 데이터를 가져오도록 캐시 우회
  if (url.pathname.startsWith("/api/")) return

  // NetworkOnly: 카카오 지도 관련 요청 — Kakao Maps 약관상 타일 및 API 응답 캐싱 금지
  if (url.hostname.includes("kakao.com")) return

  // Cache-first: 정적 자산 — 빌드 해시가 포함되어 있어 내용 변경 시 URL 자체가 바뀜
  // 따라서 캐시 히트 시 네트워크 요청 없이 즉시 반환해도 안전
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(js|css|png|ico|webmanifest|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone()
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone))
            return res
          })
      )
    )
    return
  }

  // Network-first: HTML 페이지 — 항상 최신 서버 렌더링 결과를 우선 사용
  // 네트워크 실패(오프라인) 시 캐시된 페이지로 폴백, 캐시도 없으면 /offline 반환
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(PAGES_CACHE).then((c) => c.put(request, clone))
          return res
        })
        .catch(
          () =>
            caches.match(request) ||
            caches.match("/offline")
        )
    )
  }
})
