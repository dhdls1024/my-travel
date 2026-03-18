// 마커 팝업 컴포넌트 — 지도 마커 클릭 시 장소 정보 표시
// 카카오 CustomOverlay 내부에 렌더링
"use client"

import type { Place } from "@/types/travel"

interface MarkerPopupProps {
  place: Place
  // 팝업 닫기 콜백
  onClose: () => void
}

// TODO: Task007에서 구현 예정
// - 장소명, 카테고리, 메모, 외부 링크 표시
// - 닫기 버튼
// - 카카오 CustomOverlay 내부 HTML로 렌더링
export default function MarkerPopup({ place, onClose }: MarkerPopupProps) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium">{place.name}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      {place.memo && (
        <p className="mt-1 text-sm text-gray-500">{place.memo}</p>
      )}
    </div>
  )
}
