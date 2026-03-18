// 날짜 드롭다운 필터 컴포넌트 — 특정 날짜의 장소만 필터링
// 클라이언트 컴포넌트 (Select 상태를 부모로 전달하는 제어 컴포넌트)
"use client"

import { Calendar } from "lucide-react"
// date-fns: 날짜 파싱 및 포맷팅 유틸리티
// parseISO — ISO 8601 문자열을 Date 객체로 변환
// format — Date 객체를 지정된 형식 문자열로 변환
import { format, parseISO } from "date-fns"
// ko — 한국어 로케일 (요일·월 이름을 한글로 출력하기 위해 사용)
import { ko } from "date-fns/locale"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// "전체 날짜" 옵션의 value 상수 — 매직 스트링 방지
const ALL_DATES_VALUE = "all"

interface DateFilterProps {
  // 사용 가능한 날짜 목록 (Place의 visitDate에서 추출, 정렬됨)
  dates: string[]
  // 현재 선택된 날짜 (null이면 "전체 날짜")
  selected: string | null
  // 날짜 변경 콜백 — 부모 컴포넌트에서 장소 목록 필터링 처리
  onSelect: (date: string | null) => void
}

// DateFilter — 날짜 드롭다운 필터 컴포넌트
// shadcn Select를 기반으로 "전체 날짜" + 각 날짜 옵션을 "M월 d일 (요일)" 형태로 표시한다
export default function DateFilter({ dates, selected, onSelect }: DateFilterProps) {
  // Select value는 string이어야 하므로 null 선택 상태를 ALL_DATES_VALUE로 매핑
  const currentValue = selected ?? ALL_DATES_VALUE

  // 날짜 변경 시 "all"이면 null, 나머지는 ISO 날짜 문자열로 전달
  const handleValueChange = (value: string) => {
    onSelect(value === ALL_DATES_VALUE ? null : value)
  }

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className="w-[180px]"
        aria-label="날짜 필터 선택"
      >
        {/* Calendar 아이콘 — 날짜 필터 트리거 시각적 힌트 */}
        <Calendar className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <SelectValue placeholder="전체 날짜" />
      </SelectTrigger>

      <SelectContent>
        {/* 전체 날짜 옵션 */}
        <SelectItem value={ALL_DATES_VALUE}>전체 날짜</SelectItem>

        {/* 날짜 목록 — "M월 d일 (EEE)" 형태로 표시 (예: 4월 10일 (금)) */}
        {dates.map((date) => (
          <SelectItem key={date} value={date}>
            {format(parseISO(date), "M월 d일 (EEE)", { locale: ko })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
