// 마커 팝업 HTML 생성 모듈
// 카카오 CustomOverlay content에 삽입할 HTML 문자열을 반환하는 순수 함수 모음
// React 렌더링이 아닌 kakao.maps.CustomOverlay에 직접 주입되므로 "use client" 불필요

import type { Place } from "@/types/travel"
import { MARKER_COLORS } from "@/lib/constants"

// 카테고리에 해당하는 마커 색상 반환
// MARKER_COLORS에 없는 카테고리는 기본 회색 처리
function getCategoryColor(category: Place["category"]): string {
  return MARKER_COLORS[category] ?? "#6B7280"
}

// 카카오 CustomOverlay에 삽입할 팝업 HTML 문자열 생성
// data-popup-close 속성은 MapView에서 클릭 이벤트 감지용으로 사용
export function createPopupHTML(place: Place): string {
  const categoryColor = getCategoryColor(place.category)

  // 메모 영역 — 값이 있을 때만 렌더링
  const memoHTML = place.memo
    ? `<p class="kakao-popup-memo" style="font-size:12px; color:#6B7280; margin:0 0 6px 0; line-height:1.4;">${place.memo}</p>`
    : ""

  // 외부 링크 영역 — url이 있을 때만 렌더링, target="_blank"로 새 탭 열기
  const linkHTML = place.url
    ? `<a
        href="${place.url}"
        target="_blank"
        rel="noopener noreferrer"
        style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#3B82F6; text-decoration:none;"
      >
        외부 링크 열기 ↗
      </a>`
    : ""

  return `
    <div class="kakao-popup" style="position:relative; background:#fff; border-radius:8px; padding:12px 16px; min-width:180px; max-width:240px; box-shadow:0 4px 12px rgba(0,0,0,0.15); border:1px solid #e5e7eb;">

      <!-- 카테고리 컬러 좌측 바 -->
      <div style="position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:8px 0 0 8px; background:${categoryColor};"></div>

      <!-- 닫기 버튼 — data-popup-close로 MapView에서 이벤트 감지 -->
      <button
        data-popup-close="true"
        style="position:absolute; top:8px; right:8px; background:none; border:none; cursor:pointer; color:#9CA3AF; font-size:14px; line-height:1; padding:0;"
        aria-label="팝업 닫기"
      >✕</button>

      <!-- 내용 영역 -->
      <div style="padding-left:8px; padding-right:16px;">

        <!-- 카테고리 배지 -->
        <span style="display:inline-block; padding:2px 8px; border-radius:9999px; font-size:11px; color:#fff; background:${categoryColor}; margin-bottom:6px;">
          ${place.category}
        </span>

        <!-- 장소명 -->
        <p class="kakao-popup-name" style="font-weight:600; font-size:14px; margin:0 0 4px 0; color:#111827;">
          ${place.name}
        </p>

        ${memoHTML}
        ${linkHTML}
      </div>
    </div>

    <!-- 말풍선 꼬리 삼각형 — 마커 위치를 가리키는 화살표 -->
    <div class="kakao-popup-tail" style="position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-top:8px solid #fff;"></div>
  `
}

// 더미 컴포넌트 인터페이스 — 기존 import 구조 호환성 유지
interface MarkerPopupProps {
  place: Place
  // 팝업 닫기 콜백
  onClose: () => void
}

// 기존 default export 유지 — React 컴포넌트 형태가 필요한 경우 호환용
// 실제 지도에서는 createPopupHTML() named export 사용
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
