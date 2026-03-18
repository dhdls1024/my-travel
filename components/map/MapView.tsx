// 카카오 지도 루트 컴포넌트 — 브라우저 전용 (use client 필수)
// next/script strategy="afterInteractive"로 카카오 Maps JS API 로드 후 지도 초기화
"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Script from "next/script"

import type { Place } from "@/types/travel"
import { placeToLatLng } from "@/lib/map-utils"
import { MARKER_COLORS } from "@/lib/constants"
import { createPopupHTML } from "@/components/map/MarkerPopup"

interface MapViewProps {
  // 지도에 표시할 장소 목록 (latitude/longitude가 있는 장소만 마커로 표시)
  places: Place[]
}

export default function MapView({ places }: MapViewProps) {
  // mapContainerRef: 카카오 지도 SDK가 DOM을 직접 제어하므로 ref로 관리
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // mapRef: kakao.maps.Map 인스턴스 — 재초기화 방지 및 마커 이벤트에서 접근
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  // activeOverlayRef: 현재 열린 팝업 CustomOverlay 저장
  // 새 마커 클릭 시 이전 팝업을 닫기 위해 ref로 추적 (상태보다 ref가 적합 — 렌더링 불필요)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeOverlayRef = useRef<any>(null)

  // isReady: 카카오 SDK 사용 가능 여부 (스크립트 로드 + window.kakao 존재 모두 확인)
  const [isReady, setIsReady] = useState(false)

  // initMap — 카카오 지도 초기화 및 마커 생성
  // useCallback: places 변경 시에만 함수 재생성 (useEffect 의존성 배열 안정화)
  const initMap = useCallback(() => {
    // 컨테이너가 없거나 이미 초기화된 경우 중복 실행 방지
    if (!mapContainerRef.current || mapRef.current) return

    // window.kakao 존재 여부 방어 체크
    // SPA 내비게이션 시 스크립트가 캐시되어 onLoad가 발화하지 않을 수 있음
    if (!window.kakao) return

    // kakao.maps.load() 콜백 — SDK 내부 모듈 로드 완료 후 실행 보장
    // autoload=false 옵션과 쌍으로 사용 필수
    window.kakao.maps.load(() => {
      // 초기 중심 좌표: 대한민국 중심부 (모든 마커가 보이도록 fitBounds로 덮어씀)
      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 13,
      }

      const map = new window.kakao.maps.Map(mapContainerRef.current, options)
      mapRef.current = map

      // 모든 마커 좌표를 포함하는 bounds — fitBounds로 자동 줌/중심 조정에 사용
      const bounds = new window.kakao.maps.LatLngBounds()
      let hasMarkers = false

      places.forEach((place) => {
        const latlng = placeToLatLng(place)
        // 좌표가 없거나 유효 범위 밖인 장소는 마커 생성 생략
        if (!latlng) return

        hasMarkers = true
        const position = new window.kakao.maps.LatLng(latlng.lat, latlng.lng)
        bounds.extend(position)

        // 카테고리 컬러 원형 마커 — kakao.maps.CustomOverlay로 HTML 직접 삽입
        // 기본 Marker 대신 CustomOverlay를 사용하는 이유:
        //   기본 Marker는 이미지 기반이라 카테고리별 색상 적용이 번거로움
        const markerColor = MARKER_COLORS[place.category]
        const markerContent = `
          <div style="
            width:28px; height:28px; border-radius:50%;
            background:${markerColor}; border:2px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            cursor:pointer; display:flex; align-items:center; justify-content:center;
          " data-place-id="${place.id}">
            <div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>
          </div>
        `

        const markerOverlay = new window.kakao.maps.CustomOverlay({
          position,
          content: markerContent,
          yAnchor: 0.5,
          xAnchor: 0.5,
          zIndex: 1,
        })
        markerOverlay.setMap(map)

        // 마커 클릭 이벤트 — CustomOverlay는 kakao 이벤트 시스템 미지원
        // setMap() 후 content가 DOM에 삽입되므로 setTimeout으로 다음 틱에 바인딩
        setTimeout(() => {
          const el = document.querySelector(`[data-place-id="${place.id}"]`)
          if (!el) return

          el.addEventListener("click", () => {
            // 이미 열린 팝업이 있으면 닫기 (한 번에 하나의 팝업만 표시)
            if (activeOverlayRef.current) {
              activeOverlayRef.current.setMap(null)
              activeOverlayRef.current = null
            }

            // 팝업 CustomOverlay 생성 — MarkerPopup.createPopupHTML로 HTML 생성
            const popupContent = createPopupHTML(place)
            const popupOverlay = new window.kakao.maps.CustomOverlay({
              position,
              content: popupContent,
              yAnchor: 1.4, // 마커 위쪽에 팝업 표시 (1.0이면 마커 아래)
              xAnchor: 0.5,
              zIndex: 10,
            })
            popupOverlay.setMap(map)
            activeOverlayRef.current = popupOverlay

            // 팝업 닫기 버튼 이벤트 — data-popup-close 속성으로 닫기 버튼 감지
            // 팝업 DOM도 setTimeout으로 다음 틱에 바인딩
            setTimeout(() => {
              const closeBtn = document.querySelector("[data-popup-close]")
              if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                  popupOverlay.setMap(null)
                  activeOverlayRef.current = null
                })
              }
            }, 0)
          })
        }, 0)
      })

      // 마커가 하나 이상 있으면 모든 마커가 화면에 들어오도록 자동 조정
      if (hasMarkers) {
        map.setBounds(bounds)
      }
    })
  }, [places])

  // 컴포넌트 마운트 시 window.kakao가 이미 로드된 경우 처리
  // SPA 내비게이션: 스크립트가 캐시되어 onLoad가 다시 발화하지 않으므로
  // 마운트 시점에 window.kakao 존재 여부를 직접 확인
  useEffect(() => {
    if (typeof window !== "undefined" && window.kakao) {
      setIsReady(true)
    }
  }, [])

  // isReady가 true가 된 이후 지도 초기화
  useEffect(() => {
    if (isReady) {
      initMap()
    }
  }, [isReady, initMap])

  // Script onLoad 핸들러 — 최초 페이지 로드 시 스크립트 다운로드 완료 후 호출
  const handleScriptLoad = useCallback(() => {
    setIsReady(true)
  }, [])

  return (
    <div className="relative h-full w-full">
      {/* 카카오 Maps SDK 스크립트
          strategy="afterInteractive": 페이지 인터랙티브 이후 로드 (SSR 환경에서 window 접근 방지)
          autoload=false: kakao.maps.load() 콜백 패턴 사용을 위해 자동 로드 비활성화 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      {/* 지도 컨테이너 — h-full로 부모 높이를 그대로 사용
          부모 컴포넌트에서 반드시 고정 높이를 지정해야 지도가 렌더링됨 */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  )
}
