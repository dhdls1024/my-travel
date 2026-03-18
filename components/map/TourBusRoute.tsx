// 동해시 투어버스 순환 노선 오버레이 컴포넌트
// kakao.maps.Polyline으로 노선을 그리고,
// kakao.maps.CustomOverlay로 정류장 번호 마커와 화살표 방향 표시를 렌더링한다.
//
// 사용처: MapView에서 <TourBusRoute map={mapInstance} busStops={busStops} /> 형태로 삽입
// 주의: 반드시 kakao.maps.load() 콜백 이후에 map 인스턴스를 전달해야 한다.

"use client"

import { useEffect, useRef, useCallback } from "react"

import type { BusStop } from "@/types/travel"
import {
  TOUR_BUS_LINE_COLOR,
  TOUR_BUS_LINE_WIDTH,
  TOUR_BUS_STOP_SIZE,
  TOUR_BUS_ORIGIN_COLOR,
  TOUR_BUS_STOP_COLOR,
  TOUR_BUS_ARROW_INTERVAL,
} from "@/lib/constants"

interface TourBusRouteProps {
  // 카카오 지도 인스턴스 — null이면 렌더링 건너뜀
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any
  // Notion DB에서 조회한 정류장 목록 (order 오름차순 정렬 완료)
  busStops: BusStop[]
}

// ─── 마커 HTML 생성 헬퍼 ──────────────────────────────────────────────────────

// 정류장 번호 마커 HTML 생성
// isOrigin: 0번 출발/도착점 여부 — true면 빨간 원, false면 파란 원
// data-bus-stop-id: 클릭 이벤트 바인딩을 위한 식별자
function createStopMarkerHTML(id: string, label: string, isOrigin: boolean): string {
  const bgColor = isOrigin ? TOUR_BUS_ORIGIN_COLOR : TOUR_BUS_STOP_COLOR
  const size = TOUR_BUS_STOP_SIZE

  return `
    <div
      data-bus-stop-id="${id}"
      style="
        width:${size}px; height:${size}px; border-radius:50%;
        background:${bgColor}; border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        display:flex; align-items:center; justify-content:center;
        font-size:11px; font-weight:700; color:#fff;
        font-family: sans-serif;
        cursor: ${isOrigin ? "default" : "pointer"};
      "
    >
      ${label}
    </div>
  `
}

// 정류장 팝업 HTML 생성 — 정류장명 / 운행 시간(있을 때) / 네이버 지도 버튼
// Place 팝업(MarkerPopup)과 동일한 구조로 일관성 유지
// data-bus-stop-popup-close: 닫기 버튼 식별자
function createBusStopPopupHTML(name: string, url: string, time?: string): string {
  // 운행 시간: "1회: 09:40 / 2회: 10:40 / ..." 형식을 " / " 기준으로 줄바꿈 처리
  // Place의 memo 출력 방식(줄바꿈 없이 텍스트 그대로)과 달리 회차가 많아 줄바꿈이 가독성에 유리
  const timeHTML = time
    ? `<p style="
        font-size:11px; color:#6b7280; margin:0 0 10px;
        line-height:1.6; white-space:pre-wrap; word-break:keep-all;
      ">${time.replace(/ \/ /g, "\n")}</p>`
    : ""

  return `
    <div style="
      background:#fff; border:1px solid #e5e7eb; border-radius:10px;
      padding:12px 14px; min-width:180px; max-width:220px;
      box-shadow:0 4px 12px rgba(0,0,0,0.15); font-family:sans-serif;
      position:relative;
    ">
      <button
        data-bus-stop-popup-close
        style="
          position:absolute; top:6px; right:8px;
          background:none; border:none; cursor:pointer;
          font-size:14px; color:#9ca3af; line-height:1;
        "
      >✕</button>
      <p style="font-size:12px; font-weight:600; color:#111827; margin:0 0 8px; padding-right:16px;">
        🚌 ${name}
      </p>
      ${timeHTML}
      <a
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display:inline-block; padding:5px 10px;
          background:#03c75a; color:#fff; border-radius:6px;
          font-size:11px; font-weight:600; text-decoration:none;
        "
      >
        네이버 지도로 보기
      </a>
    </div>
  `
}

// 두 좌표 사이의 방위각(도)을 계산합니다.
// 폴리라인 중간 지점에 화살표를 올바른 방향으로 회전시키기 위해 사용
function calcBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const dLng = toRad(lng2 - lng1)
  const lat1R = toRad(lat1)
  const lat2R = toRad(lat2)

  const x = Math.sin(dLng) * Math.cos(lat2R)
  const y =
    Math.cos(lat1R) * Math.sin(lat2R) -
    Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng)

  // atan2 결과를 0~360도 범위로 정규화
  return (toDeg(Math.atan2(x, y)) + 360) % 360
}

// 두 좌표의 중간점을 계산합니다.
// 화살표 오버레이를 구간 중앙에 배치하기 위해 사용
function midPoint(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): { lat: number; lng: number } {
  return {
    lat: (lat1 + lat2) / 2,
    lng: (lng1 + lng2) / 2,
  }
}

// 화살표 오버레이 HTML 생성
// bearing: 방위각(도) — CSS rotate로 화살표 회전
function createArrowHTML(bearing: number): string {
  return `
    <div style="
      transform: rotate(${bearing}deg);
      font-size:16px; color:${TOUR_BUS_LINE_COLOR};
      text-shadow:0 0 4px rgba(0,0,0,0.5);
      pointer-events:none; line-height:1;
    ">▲</div>
  `
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function TourBusRoute({ map, busStops }: TourBusRouteProps) {
  // polylineRef: 노선 폴리라인 인스턴스 — 언마운트 시 제거
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null)

  // stopOverlaysRef: 정류장 번호 마커 + 이름 레이블 오버레이 목록
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stopOverlaysRef = useRef<any[]>([])

  // arrowOverlaysRef: 화살표 방향 오버레이 목록
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrowOverlaysRef = useRef<any[]>([])

  // activePopupRef: 현재 열린 정류장 팝업 CustomOverlay
  // 새 마커 클릭 시 이전 팝업을 닫기 위해 ref로 추적
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activePopupRef = useRef<any>(null)

  // delegatedCleanupRef: setupDelegatedClickEvents가 반환한 클린업 함수
  // drawRoute 재호출 또는 언마운트 시 이전 이벤트 리스너를 제거하기 위해 저장
  const delegatedCleanupRef = useRef<(() => void) | undefined>(undefined)

  // clearRoute — 지도에 표시된 모든 투어버스 오버레이 및 이벤트 리스너 제거
  const clearRoute = useCallback(() => {
    // 위임 이벤트 리스너 먼저 제거
    delegatedCleanupRef.current?.()
    delegatedCleanupRef.current = undefined

    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }
    stopOverlaysRef.current.forEach((o) => o.setMap(null))
    stopOverlaysRef.current = []
    arrowOverlaysRef.current.forEach((o) => o.setMap(null))
    arrowOverlaysRef.current = []
    if (activePopupRef.current) {
      activePopupRef.current.setMap(null)
      activePopupRef.current = null
    }
  }, [])

  // setupDelegatedClickEvents — 이벤트 위임으로 정류장 마커 클릭 처리
  //
  // 개별 마커 DOM에 직접 이벤트를 바인딩하지 않는 이유:
  // 카카오 CustomOverlay는 지도 pan/zoom 시 화면 밖으로 나간 마커의 DOM을 제거하고
  // 다시 들어올 때 새로 생성한다. 따라서 최초 바인딩한 이벤트가 소멸하여 클릭이 안 됨.
  // 해결책: 지도 컨테이너(항상 살아있는 부모)에 이벤트를 위임 등록하고
  // 클릭된 요소의 data-bus-stop-id로 어떤 정류장인지 판별한다.
  const setupDelegatedClickEvents = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (validStops: BusStop[], positionMap: Map<string, any>) => {
      // 이미 등록된 위임 이벤트가 있으면 제거 (drawRoute 재호출 시 중복 방지)
      const mapContainer = map.getNode() as HTMLElement | null
      if (!mapContainer) return

      // URL이 있는 정류장만 id → {stop, position} 맵으로 준비
      const stopLookup = new Map(
        validStops
          .filter((s) => s.url)
          .map((s) => [s.id, { stop: s, position: positionMap.get(s.id) }])
      )

      const handleContainerClick = (e: Event) => {
        // 클릭된 요소 또는 가장 가까운 [data-bus-stop-id] 조상 탐색
        const target = (e.target as HTMLElement).closest("[data-bus-stop-id]") as HTMLElement | null
        if (!target) return

        const stopId = target.dataset.busStopId
        if (!stopId) return

        const entry = stopLookup.get(stopId)
        if (!entry) return

        e.stopPropagation()

        // 이미 열린 팝업이 있으면 닫기
        if (activePopupRef.current) {
          activePopupRef.current.setMap(null)
          activePopupRef.current = null
        }

        const popupOverlay = new window.kakao.maps.CustomOverlay({
          position: entry.position,
          content: createBusStopPopupHTML(entry.stop.name, entry.stop.url!, entry.stop.time),
          yAnchor: 1.4,
          xAnchor: 0.5,
          zIndex: 10,
        })
        popupOverlay.setMap(map)
        activePopupRef.current = popupOverlay
      }

      const handlePopupClose = (e: Event) => {
        const target = e.target as HTMLElement
        if (!target.closest("[data-bus-stop-popup-close]")) return
        e.stopPropagation()
        if (activePopupRef.current) {
          activePopupRef.current.setMap(null)
          activePopupRef.current = null
        }
      }

      mapContainer.addEventListener("click", handleContainerClick)
      mapContainer.addEventListener("click", handlePopupClose)

      // 클린업 함수 반환 — clearRoute 또는 언마운트 시 호출
      return () => {
        mapContainer.removeEventListener("click", handleContainerClick)
        mapContainer.removeEventListener("click", handlePopupClose)
      }
    },
    [map]
  )

  // drawRoute — 폴리라인 + 정류장 마커 + 화살표 오버레이를 지도에 그린다
  const drawRoute = useCallback(() => {
    if (!map) return
    // 좌표가 있는 정류장만 지도에 표시
    const validStops = busStops.filter((s) => s.latitude != null && s.longitude != null)
    if (validStops.length === 0) return

    clearRoute()

    // ── 폴리라인 경로 좌표 배열 생성 ──
    // 순환 노선이므로 마지막에 0번 좌표를 다시 추가해 닫힌 경로로 만든다
    const origin = validStops[0]

    // kakao.maps.LatLng 객체 배열 — Polyline의 path로 전달
    const path = validStops.map(
      (stop) => new window.kakao.maps.LatLng(stop.latitude!, stop.longitude!)
    )
    // 출발지 좌표를 path 끝에 추가 → 순환 노선 완성
    path.push(new window.kakao.maps.LatLng(origin.latitude!, origin.longitude!))

    // kakao.maps.Polyline — 정류장을 순서대로 연결하는 선
    const polyline = new window.kakao.maps.Polyline({
      path,
      strokeWeight: TOUR_BUS_LINE_WIDTH,
      strokeColor: TOUR_BUS_LINE_COLOR,
      strokeOpacity: 0.85,
      strokeStyle: "solid",
    })
    polyline.setMap(map)
    polylineRef.current = polyline

    // ── 정류장 번호 마커 오버레이 + 위치 맵 구성 ──
    // positionMap: id → LatLng — 이벤트 위임 핸들러에서 팝업 위치 결정에 사용
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const positionMap = new Map<string, any>()

    validStops.forEach((stop) => {
      const position = new window.kakao.maps.LatLng(stop.latitude!, stop.longitude!)
      positionMap.set(stop.id, position)

      // order 0번이 출발/도착점 — isOrigin이면 빨간 원 + "S" 라벨
      const isOrigin = stop.order === 0
      // 마커 라벨: 출발/도착점은 "S", 나머지는 Notion DB의 order 값 그대로 표시
      const label = isOrigin ? "S" : String(stop.order)

      // 번호 원형 마커 오버레이 — data-bus-stop-id로 이벤트 위임 식별
      const markerOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: createStopMarkerHTML(stop.id, label, isOrigin),
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 5,
      })
      markerOverlay.setMap(map)
      stopOverlaysRef.current.push(markerOverlay)
    })

    // 이벤트 위임 등록 — 지도 컨테이너에 한 번만 등록하여 pan/zoom 후에도 동작
    delegatedCleanupRef.current = setupDelegatedClickEvents(validStops, positionMap)

    // ── 화살표 방향 오버레이 ──
    // 구간마다 TOUR_BUS_ARROW_INTERVAL 간격으로 화살표를 중간 지점에 표시
    // 마지막 구간: 마지막 정류장 → 0번(순환 복귀)도 포함
    const stopCount = validStops.length
    for (let i = 0; i < stopCount; i += TOUR_BUS_ARROW_INTERVAL) {
      const from = validStops[i]
      // 마지막 정류장의 다음은 0번(출발지)으로 순환
      const to = validStops[(i + 1) % stopCount]

      const bearing = calcBearing(from.latitude!, from.longitude!, to.latitude!, to.longitude!)
      const mid = midPoint(from.latitude!, from.longitude!, to.latitude!, to.longitude!)

      const arrowOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(mid.lat, mid.lng),
        content: createArrowHTML(bearing),
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 3,
      })
      arrowOverlay.setMap(map)
      arrowOverlaysRef.current.push(arrowOverlay)
    }
  }, [map, busStops, clearRoute, setupDelegatedClickEvents])

  // map 또는 busStops 변경 시 노선을 다시 그린다
  // busStops가 빈 배열로 바뀌면 clearRoute()가 호출되어 노선이 제거됨
  useEffect(() => {
    if (!map) return

    if (busStops.length === 0) {
      clearRoute()
      return
    }

    drawRoute()

    // 컴포넌트 언마운트 또는 map/busStops 변경 시 오버레이 전체 제거
    return () => {
      clearRoute()
    }
  }, [map, busStops, drawRoute, clearRoute])

  // 이 컴포넌트는 DOM을 직접 렌더링하지 않는다.
  // 카카오 지도 오버레이 API를 통해서만 지도에 요소를 추가한다.
  return null
}
