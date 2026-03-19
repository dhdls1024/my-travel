// navigator.geolocation.getCurrentPosition() 을 React 훅으로 래핑하는 커스텀 훅
// "use client" 불필요 — 훅 파일은 컴포넌트가 아니므로 사용처(MapViewWrapper)에서 처리됨
// 컴포넌트에서 현재 위치, 로딩 상태, 권한 거부 여부를 쉽게 사용할 수 있도록 추상화

import { useState, useEffect, useRef, useCallback } from "react"

// 위치 조회 옵션 상수 — 매직넘버 방지
const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10000,         // 10초 초과 시 오류 처리
  maximumAge: 30000,      // 30초 이내의 캐시된 위치 재사용 (배터리 절약)
  enableHighAccuracy: false, // GPS 대신 WiFi/기지국 사용 (빠른 응답 우선)
}

// GeolocationPositionError.code 중 권한 거부에 해당하는 코드
const PERMISSION_DENIED_CODE = 1

interface GeolocationState {
  position: { lat: number; lng: number } | null
  permissionDenied: boolean // 사용자가 위치 권한을 명시적으로 거부한 경우 true
  isLoading: boolean
  refresh: () => void // permissionDenied 초기화 후 재조회
}

/**
 * 브라우저 Geolocation API를 React 훅으로 래핑
 *
 * - SSR 환경(Next.js 서버)에서는 navigator가 없으므로 초기값만 반환
 * - 컴포넌트 언마운트 시 진행 중인 위치 요청을 취소하여 메모리 누수 방지
 * - refresh() 호출 시 permissionDenied를 초기화한 뒤 위치를 재조회
 */
export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 언마운트 여부를 추적하여 비동기 콜백에서 setState 호출을 방지
  const isMountedRef = useRef(true)

  // refresh() 트리거용 카운터 — 값이 바뀔 때마다 useEffect가 재실행됨
  const [refreshCount, setRefreshCount] = useState(0)

  /**
   * 위치 재조회 함수
   * permissionDenied를 false로 초기화한 뒤 새로운 위치 조회를 요청한다.
   * 이전에 권한 거부 상태였더라도 브라우저 설정에서 권한을 복구한 경우 재시도할 수 있도록 한다.
   */
  const refresh = useCallback(() => {
    setPermissionDenied(false)
    setRefreshCount((prev) => prev + 1)
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    // SSR 방어: 서버 환경 또는 Geolocation API 미지원 브라우저에서는 즉시 종료
    if (typeof window === "undefined" || !navigator.geolocation) {
      return
    }

    setIsLoading(true)

    // getCurrentPosition은 취소 불가이므로 isMountedRef로 언마운트 후 setState 차단
    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (pos) => {
        if (!isMountedRef.current) return
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setIsLoading(false)
      },
      // 오류 콜백 — 권한 거부(code 1)와 그 외 오류를 구분하여 처리
      (err) => {
        if (!isMountedRef.current) return
        if (err.code === PERMISSION_DENIED_CODE) {
          setPermissionDenied(true)
        }
        setIsLoading(false)
      },
      GEOLOCATION_OPTIONS,
    )

    // cleanup: 컴포넌트 언마운트 시 isMountedRef를 false로 설정하여 콜백 실행 차단
    return () => {
      isMountedRef.current = false
    }
  }, [refreshCount]) // refreshCount 변경 시마다 위치 재조회

  return { position, permissionDenied, isLoading, refresh }
}
