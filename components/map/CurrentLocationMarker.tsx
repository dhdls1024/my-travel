// CurrentLocationMarker — GPS 현재 위치를 파란 펄싱 원형 마커로 표시하는 컴포넌트
// kakao.maps.CustomOverlay를 사용하여 지도 위에 현재 위치 마커를 렌더링한다.
// 사용처: MapView에서 <CurrentLocationMarker map={mapInstance} position={coords} />
// 주의: map 인스턴스는 반드시 kakao.maps.load() 콜백 이후에 전달해야 한다.

"use client"

import { useEffect, useRef } from "react"

interface CurrentLocationMarkerProps {
  // 카카오 지도 인스턴스 — null이면 렌더링 건너뜀
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any
  // GPS로 수신한 현재 위치 좌표
  position: { lat: number; lng: number }
}

// createCurrentLocationContent — 파란 펄싱 원형 마커 HTML 문자열 생성
// CustomOverlay의 content 속성에 직접 삽입한다.
//
// animate-ping을 사용하는 이유:
// CustomOverlay content는 HTML 문자열로 삽입되어 실제 DOM이 되므로
// Tailwind의 animate-ping 클래스가 정상 동작한다.
// @keyframes 인라인 style에서는 CSS 애니메이션 정의를 document에서 찾을 수 없어
// 작동하지 않기 때문에 Tailwind 클래스 방식을 선택한다.
function createCurrentLocationContent(): string {
  return `
    <div style="
      position: relative;
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
    ">
      <!-- 외부 펄싱 링: animate-ping으로 바깥으로 퍼지는 파란 반투명 원 -->
      <div
        class="animate-ping"
        style="
          position: absolute;
          width: 24px; height: 24px; border-radius: 50%;
          background: rgba(59, 130, 246, 0.5);
        "
      ></div>

      <!-- 내부 불투명 파란 원: 현재 위치의 고정된 기준점 -->
      <div style="
        position: absolute;
        width: 16px; height: 16px; border-radius: 50%;
        background: #3B82F6;
        border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.5);
      ">
        <!-- 중심 흰 점: 정확한 위치 표시 -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 6px; height: 6px; border-radius: 50%;
          background: #fff;
        "></div>
      </div>
    </div>
  `
}

// CurrentLocationMarker — position prop이 바뀔 때마다 오버레이를 재생성한다.
// DOM을 직접 렌더링하지 않고 카카오 오버레이 API로만 지도에 요소를 추가한다.
export default function CurrentLocationMarker({
  map,
  position,
}: CurrentLocationMarkerProps) {
  // overlayRef: 현재 지도에 표시 중인 CustomOverlay 인스턴스
  // 언마운트 또는 position 변경 시 이전 오버레이를 제거하기 위해 ref로 보관
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayRef = useRef<any>(null)

  useEffect(() => {
    // map이 준비되지 않으면 렌더링하지 않는다
    if (!map) return

    // 이전 오버레이가 있으면 지도에서 제거 후 교체
    if (overlayRef.current) {
      overlayRef.current.setMap(null)
      overlayRef.current = null
    }

    // kakao.maps.CustomOverlay — 현재 위치 좌표에 파란 펄싱 마커를 표시
    // yAnchor/xAnchor: 0.5로 설정하여 마커 중심이 좌표에 정렬되도록 한다
    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(position.lat, position.lng),
      content: createCurrentLocationContent(),
      yAnchor: 0.5,
      xAnchor: 0.5,
      zIndex: 10,
    })
    overlay.setMap(map)
    overlayRef.current = overlay

    // 컴포넌트 언마운트 또는 position/map 변경 시 오버레이 제거
    return () => {
      overlay.setMap(null)
      overlayRef.current = null
    }
  }, [map, position.lat, position.lng])

  // 이 컴포넌트는 DOM을 직접 렌더링하지 않는다.
  // 카카오 지도 오버레이 API를 통해서만 지도에 요소를 추가한다.
  return null
}
