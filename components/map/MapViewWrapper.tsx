// MapViewWrapper — dynamic ssr:false를 클라이언트 컴포넌트에서 처리
// Next.js App Router: 서버 컴포넌트에서 ssr:false 사용 불가 → 클라이언트 래퍼로 분리
// 날짜 필터 상태 관리 및 UI도 이 컴포넌트에서 담당
"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"

import { useGeolocation } from "@/lib/use-geolocation"
import type { Place, BusStop } from "@/types/travel"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 날짜 필터 "전체" 선택 시 사용하는 sentinel 값
const ALL_DATES_VALUE = "all"

// 카카오 SDK는 브라우저 전용 — SSR 환경에서 window 접근 방지를 위해 ssr:false
const MapViewDynamic = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    // 지도 로딩 중 플레이스홀더 — 동일한 높이 유지하여 레이아웃 시프트 방지
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground text-sm">지도를 불러오는 중...</p>
    </div>
  ),
})

interface MapViewWrapperProps {
  places: Place[]
  // 투어버스 정류장 목록 — 없으면 토글 버튼 자체를 숨김
  busStops?: BusStop[]
}

// formatDateLabel — ISO 날짜 문자열(앞 10자리)을 "M월 D일" 형태로 변환
// 예: "2026-04-03" → "4월 3일"
function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split("-")
  return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`
}

// extractUniqueDates — places에서 고유한 방문 날짜 목록을 오름차순으로 추출
// visitDateEnd가 있는 경우 start~end 사이 모든 날짜를 포함
// (예: 4월 3일~4월 5일 → 4월 3일, 4월 4일, 4월 5일 모두 추가)
function extractUniqueDates(places: Place[]): string[] {
  const dateSet = new Set<string>()
  places.forEach((place) => {
    const start = place.visitDate?.slice(0, 10)
    if (!start) return

    const end = place.visitDateEnd?.slice(0, 10)
    if (!end) {
      dateSet.add(start)
      return
    }

    // 범위 날짜: 날짜를 ms로 비교하여 하루씩 증가
    // toISOString() 대신 로컬 날짜 포맷으로 직접 변환 — UTC 오프셋으로 인한 날짜 밀림 방지
    const startMs = new Date(start + "T00:00:00").getTime()
    const endMs = new Date(end + "T00:00:00").getTime()
    const DAY_MS = 24 * 60 * 60 * 1000

    for (let ms = startMs; ms <= endMs; ms += DAY_MS) {
      const d = new Date(ms)
      // 로컬 날짜 기준 YYYY-MM-DD 포맷 — UTC 변환 없이 직접 추출
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      dateSet.add(`${yyyy}-${mm}-${dd}`)
    }
  })
  return Array.from(dateSet).sort()
}

// isPlaceInDateRange — 장소의 방문 날짜(또는 날짜 범위)가 선택된 날짜에 포함되는지 확인
// visitDateEnd가 있으면 start <= selectedDate <= end 범위 비교
// visitDateEnd가 없으면 visitDate와 정확히 일치하는지 비교
function isPlaceInDateRange(place: Place, selectedDate: string): boolean {
  const placeDate = place.visitDate?.slice(0, 10)
  if (!placeDate) return false

  const placeEndDate = place.visitDateEnd?.slice(0, 10)

  if (placeEndDate) {
    // 날짜 범위가 있는 경우: 선택 날짜가 범위 내에 포함되면 표시
    return placeDate <= selectedDate && selectedDate <= placeEndDate
  }

  // 단일 날짜: 정확히 일치하는 경우만 표시
  return placeDate === selectedDate
}

export default function MapViewWrapper({ places, busStops = [] }: MapViewWrapperProps) {
  // selectedDate: 현재 선택된 날짜 (undefined = 전체 표시)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  )

  // showTourBus: 투어버스 노선 표시 여부 — 기본값 false (버튼 클릭 시 활성화)
  const [showTourBus, setShowTourBus] = useState(false)

  // showCurrentLocation: GPS 현재 위치 마커 표시 토글 — 기본값 true (진입 시 바로 표시)
  const [showCurrentLocation, setShowCurrentLocation] = useState(true)

  // panToPosition: "내 위치로 이동" 버튼 클릭 시 MapView로 전달할 좌표
  // 클릭할 때마다 새 객체를 할당해 useEffect 의존성이 바뀌도록 함
  const [panToPosition, setPanToPosition] = useState<{ lat: number; lng: number } | null>(null)

  // useGeolocation: GPS 위치 조회 훅 — 권한 거부 시 permissionDenied: true
  const { position, permissionDenied } = useGeolocation()

  // uniqueDates: places에서 추출한 고유 날짜 목록
  // places가 변경될 때만 재계산 (useMemo로 최적화)
  const uniqueDates = useMemo(() => extractUniqueDates(places), [places])

  // filteredPlaces: 선택된 날짜에 따라 필터링된 장소 목록
  // 날짜 미선택(전체)이면 전체 places 반환
  const filteredPlaces = useMemo(() => {
    if (!selectedDate) return places
    return places.filter((place) => isPlaceInDateRange(place, selectedDate))
  }, [places, selectedDate])

  // handleDateChange — Select 변경 시 selectedDate 상태 업데이트
  const handleDateChange = (value: string) => {
    setSelectedDate(value === ALL_DATES_VALUE ? undefined : value)
  }

  return (
    <div className="relative h-full w-full">
      {/* 우상단 오버레이 컨트롤 영역 — 날짜 필터 + 투어버스 토글 세로 배치
          z-10: 지도 컨트롤 위에 표시 */}
      <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
        {/* 날짜 필터 Select — 고유 날짜가 있을 때만 표시 */}
        {uniqueDates.length > 0 && (
          <Select
            value={selectedDate ?? ALL_DATES_VALUE}
            onValueChange={handleDateChange}
          >
            <SelectTrigger className="w-32 bg-white text-gray-900 shadow-md hover:bg-white dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-900">
              <SelectValue placeholder="날짜 선택" />
            </SelectTrigger>
            <SelectContent>
              {/* 전체 옵션 — 필터 없이 모든 마커 표시 */}
              <SelectItem value={ALL_DATES_VALUE}>전체</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDateLabel(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 투어버스 노선 토글 버튼 — busStops가 있을 때만 표시 */}
        {busStops.length > 0 && (
          <button
            onClick={() => setShowTourBus((v) => !v)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium shadow-md transition-colors",
              showTourBus
                ? "bg-amber-500 text-white"
                : "border border-gray-200 bg-white text-gray-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            )}
          >
            🚌 투어버스 노선
          </button>
        )}

        {/* GPS 현재 위치 토글 버튼 — 항상 표시 (busStops 유무 무관) */}
        {/* permissionDenied: 위치 권한 거부 시 disabled (에러 토스트 없이 조용히 처리) */}
        <button
          onClick={() => setShowCurrentLocation((v) => !v)}
          disabled={permissionDenied}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium shadow-md transition-colors",
            showCurrentLocation && !permissionDenied
              ? "bg-blue-500 text-white"
              : "border border-gray-200 bg-white text-gray-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white",
            permissionDenied && "cursor-not-allowed opacity-50"
          )}
        >
          {permissionDenied ? "📍 위치 권한 필요" : "📍 내 위치"}
        </button>

        {/* 현재 위치로 이동 버튼 — 위치 수신 완료 시에만 노출
            우상단 컨트롤 영역에 배치하여 PC/모바일 모두 지도 영역 안에 표시 */}
        {position && !permissionDenied && (
          <button
            onClick={() => setPanToPosition({ ...position })}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            aria-label="현재 위치로 이동"
            title="현재 위치로 이동"
          >
            🎯
          </button>
        )}
      </div>

      {/* 현재 위치로 이동 버튼 — 우상단 컨트롤 영역 하단에 배치
          position이 있을 때만 표시 (권한 허용 + 좌표 수신 완료) */}

      {/* MapView에 필터링된 places와 busStops 전달
          showTourBus가 false이면 빈 배열 전달 → TourBusRoute 미표시 */}
      <MapViewDynamic
        places={filteredPlaces}
        busStops={showTourBus ? busStops : []}
        showCurrentLocation={showCurrentLocation && !permissionDenied}
        currentPosition={position}
        panToPosition={panToPosition}
      />
    </div>
  )
}
