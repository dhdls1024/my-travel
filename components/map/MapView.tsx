// 카카오 지도 루트 컴포넌트 — 브라우저 전용 (use client 필수)
// next/script strategy="afterInteractive"로 카카오 Maps JS API 로드 후 지도 초기화
"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Script from "next/script"

import type { Place, BusStop } from "@/types/travel"
import { placeToLatLng } from "@/lib/map-utils"
import { MARKER_COLORS } from "@/lib/constants"
import { createPopupHTML } from "@/components/map/MarkerPopup"
import TourBusRoute from "@/components/map/TourBusRoute"
import CurrentLocationMarker from "@/components/map/CurrentLocationMarker"

interface MapViewProps {
  // 지도에 표시할 장소 목록 (latitude/longitude가 있는 장소만 마커로 표시)
  places: Place[]
  // 투어버스 정류장 목록 — 빈 배열이면 노선 오버레이 미표시
  busStops?: BusStop[]
  // GPS 현재 위치 마커 표시 여부 (기본 false)
  showCurrentLocation?: boolean
  // 현재 위치 좌표 — Geolocation API에서 수신한 값
  currentPosition?: { lat: number; lng: number } | null
  // 이동할 좌표 — 값이 바뀔 때마다 해당 위치로 map.panTo() 실행
  // MapViewWrapper에서 "내 위치로 이동" 버튼 클릭 시 position 값을 그대로 전달
  panToPosition?: { lat: number; lng: number } | null
}

export default function MapView({
  places,
  busStops = [],
  showCurrentLocation = false,
  currentPosition = null,
  panToPosition = null,
}: MapViewProps) {
  // mapContainerRef: 카카오 지도 SDK가 DOM을 직접 제어하므로 ref로 관리
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // mapRef: kakao.maps.Map 인스턴스 — 재초기화 방지 및 마커 이벤트에서 접근
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  // activeOverlayRef: 현재 열린 팝업 CustomOverlay 저장
  // 새 마커 클릭 시 이전 팝업을 닫기 위해 ref로 추적 (상태보다 ref가 적합 — 렌더링 불필요)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeOverlayRef = useRef<any>(null)

  // overlaysRef: 현재 지도에 표시 중인 마커 오버레이 목록
  // places 변경 시 기존 마커를 일괄 제거하기 위해 ref로 추적
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlaysRef = useRef<any[]>([])

  // isReady: 카카오 SDK 사용 가능 여부 (스크립트 로드 + window.kakao 존재 모두 확인)
  const [isReady, setIsReady] = useState(false)

  // isMapInitialized: 지도 인스턴스 생성 완료 여부
  // kakao.maps.load()는 비동기이므로 mapRef.current 확인만으로는 타이밍 이슈 발생 가능
  const [isMapInitialized, setIsMapInitialized] = useState(false)

  // clearMarkers — overlaysRef에 저장된 모든 마커 오버레이를 지도에서 제거
  const clearMarkers = useCallback(() => {
    overlaysRef.current.forEach((overlay) => overlay.setMap(null))
    overlaysRef.current = []
    // 열린 팝업도 함께 닫기
    if (activeOverlayRef.current) {
      activeOverlayRef.current.setMap(null)
      activeOverlayRef.current = null
    }
  }, [])

  // bindPopupCloseEvent — 팝업 닫기 버튼에 이벤트 바인딩
  // popupOverlay: 닫을 대상 CustomOverlay
  const bindPopupCloseEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (popupOverlay: any) => {
      setTimeout(() => {
        const closeBtn = document.querySelector("[data-popup-close]")
        if (!closeBtn) return
        closeBtn.addEventListener("click", () => {
          popupOverlay.setMap(null)
          activeOverlayRef.current = null
        })
      }, 0)
    },
    []
  )

  // bindMarkerClickEvent — 마커 클릭 시 팝업 오버레이 표시
  // place: 클릭한 장소 정보, position: 마커 좌표
  const bindMarkerClickEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (place: Place, position: any) => {
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
          popupOverlay.setMap(mapRef.current)
          activeOverlayRef.current = popupOverlay
          bindPopupCloseEvent(popupOverlay)
        })
      }, 0)
    },
    [bindPopupCloseEvent]
  )

  // createMarkerOverlay — 단일 장소의 마커 오버레이 생성 후 지도에 표시
  // 생성된 오버레이를 overlaysRef에 추가하여 이후 일괄 제거 가능하게 관리
  const createMarkerOverlay = useCallback(
    (place: Place) => {
      const latlng = placeToLatLng(place)
      // 좌표가 없거나 유효 범위 밖인 장소는 마커 생성 생략
      if (!latlng) return null

      const position = new window.kakao.maps.LatLng(latlng.lat, latlng.lng)

      // 카테고리 컬러 원형 마커 — kakao.maps.CustomOverlay로 HTML 직접 삽입
      // 기본 Marker 대신 CustomOverlay를 사용하는 이유:
      //   기본 Marker는 이미지 기반이라 카테고리별 색상 적용이 번거로움
      // 구조: flex column 컨테이너 → 이름 라벨(위) → 원형 dot(아래)
      const markerColor = MARKER_COLORS[place.category]
      const markerContent = `
        <div style="
          display:flex; flex-direction:column; align-items:center;
          cursor:pointer;
        " data-place-id="${place.id}">
          <div style="
            font-size:10px; color:#333; background:#fff;
            padding:2px 4px; border-radius:4px;
            box-shadow:0 1px 4px rgba(0,0,0,0.2);
            text-align:center; margin-bottom:2px;
            max-width:70px; overflow:hidden;
            text-overflow:ellipsis; white-space:nowrap;
          ">${place.name}</div>
          <div style="
            width:28px; height:28px; border-radius:50%;
            background:${markerColor}; border:2px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            display:flex; align-items:center; justify-content:center;
          ">
            <div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>
          </div>
        </div>
      `

      const markerOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        yAnchor: 1.0, // 라벨+dot 전체 높이 기준으로 dot 하단이 좌표에 맞도록 조정
        xAnchor: 0.5,
        zIndex: 1,
      })
      markerOverlay.setMap(mapRef.current)
      overlaysRef.current.push(markerOverlay)

      // CustomOverlay는 kakao 이벤트 시스템 미지원 → DOM 이벤트 직접 바인딩
      bindMarkerClickEvent(place, position)

      return position
    },
    [bindMarkerClickEvent]
  )

  // renderMarkers — 기존 마커 전체 제거 후 places 목록으로 새 마커 일괄 생성
  // places prop 변경 시(날짜 필터 등) 호출됨
  const renderMarkers = useCallback(
    (targetPlaces: Place[]) => {
      if (!mapRef.current) return

      clearMarkers()

      // 모든 마커 좌표를 포함하는 bounds — fitBounds로 자동 줌/중심 조정에 사용
      const bounds = new window.kakao.maps.LatLngBounds()
      let hasMarkers = false

      targetPlaces.forEach((place) => {
        const position = createMarkerOverlay(place)
        if (!position) return
        hasMarkers = true
        bounds.extend(position)
      })

      // 마커가 하나 이상 있으면 모든 마커가 화면에 들어오도록 자동 조정
      if (hasMarkers) {
        mapRef.current.setBounds(bounds)
      }
    },
    [clearMarkers, createMarkerOverlay]
  )

  // initMap — 카카오 지도 인스턴스 초기화 (최초 1회만 실행)
  // 마커 생성은 renderMarkers에서 별도 처리하여 지도 재생성 없이 마커만 갱신 가능
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

      // 지도 인스턴스 준비 완료 → renderMarkers 실행 트리거
      setIsMapInitialized(true)
    })
  }, [])

  // 컴포넌트 마운트 시 window.kakao가 이미 로드된 경우 처리
  // SPA 내비게이션: 스크립트가 캐시되어 onLoad가 다시 발화하지 않으므로
  // 마운트 시점에 window.kakao 존재 여부를 직접 확인
  useEffect(() => {
    if (typeof window !== "undefined" && window.kakao) {
      setIsReady(true) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [])

  // isReady가 true가 된 이후 지도 초기화 (최초 1회)
  useEffect(() => {
    if (isReady) {
      initMap()
    }
  }, [isReady, initMap])

  // isMapInitialized 또는 places 변경 시 마커 재렌더링
  // 의존성 배열에 places를 포함 → 날짜 필터 변경 시 자동으로 마커 갱신
  useEffect(() => {
    if (isMapInitialized) {
      renderMarkers(places)
    }
  }, [isMapInitialized, places, renderMarkers])

  // panToPosition 변경 시 해당 좌표로 지도 중심 이동
  // MapViewWrapper의 "내 위치로 이동" 버튼 클릭 → position 값을 그대로 전달
  useEffect(() => {
    if (isMapInitialized && mapRef.current && panToPosition) {
      const latlng = new window.kakao.maps.LatLng(panToPosition.lat, panToPosition.lng)
      mapRef.current.panTo(latlng)
    }
  }, [isMapInitialized, panToPosition])

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
      <div ref={mapContainerRef} className="h-full w-full" role="application" aria-label="여행 장소 지도" />

      {/* 투어버스 노선 오버레이 — 지도 초기화 완료 후 렌더링
          busStops가 있을 때만 마운트하여 불필요한 카카오 API 호출 방지 */}
      {isMapInitialized && busStops.length > 0 && (
        <TourBusRoute map={mapRef.current} busStops={busStops} />
      )}

      {/* GPS 현재 위치 마커 — 위치 권한 허용 + 좌표 수신 + 토글 on 상태일 때만 표시 */}
      {isMapInitialized && showCurrentLocation && currentPosition && (
        <CurrentLocationMarker map={mapRef.current} position={currentPosition} />
      )}
    </div>
  )
}
