"use client"

// 오프라인 폴백 페이지 — Service Worker가 네트워크 오류 시 이 페이지를 반환
// "use client": window 이벤트 리스너 사용을 위해 클라이언트 컴포넌트 필수
import { useEffect } from "react"
import { MapPin } from "lucide-react"

export default function OfflinePage() {
  useEffect(() => {
    // 네트워크 복구 시 홈으로 자동 리다이렉트
    // router.push() 미사용 이유: 오프라인 환경에서 Next.js 라우터가 불안정할 수 있음
    const handleOnline = () => {
      window.location.href = "/"
    }
    window.addEventListener("online", handleOnline)
    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  return (
    // 전체 화면 중앙 정렬 레이아웃
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      {/* 오프라인 상태 아이콘 — 64px 회색, 다크모드 대응 */}
      <MapPin
        className="h-16 w-16 text-gray-400 dark:text-gray-600"
        strokeWidth={1.5}
      />

      {/* 메시지 영역 */}
      <div className="flex flex-col gap-2">
        {/* 제목 — 다크모드 대응 */}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          오프라인 상태입니다
        </h1>
        {/* 부제 — 작은 회색 텍스트, 다크모드 대응 */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          인터넷 연결을 확인하고 다시 시도해주세요
        </p>
      </div>

      {/* 새로고침 버튼 — window.location.reload()로 현재 페이지 강제 새로고침 */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
      >
        새로고침
      </button>
    </main>
  )
}
