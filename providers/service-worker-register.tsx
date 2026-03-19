"use client"

// ServiceWorkerRegister — SW를 브라우저에 등록하는 클라이언트 컴포넌트
// "use client" 필수: navigator.serviceWorker는 브라우저 전용 API
// layout.tsx에 포함하여 앱 전체에서 한 번만 실행됨
import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    // SSR 방어 및 SW 미지원 브라우저 처리
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    // 페이지 로드 완료 후 SW 등록 — 초기 렌더링 성능 영향 최소화
    // load 이벤트 이후 등록하면 중요 리소스 다운로드를 방해하지 않음
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          // SW 등록 실패는 앱 기능에 영향 없음 — 콘솔 경고만 출력
          // PWA 오프라인 기능만 비활성화되고 핵심 기능은 정상 동작
          console.warn("Service Worker registration failed:", err)
        })
    })
  }, [])

  // DOM 렌더링 없음 — 순수 사이드이펙트 컴포넌트
  return null
}
