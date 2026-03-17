---
name: Notion API 기능 범위 (여행 플래너)
description: Notion API의 Database Query, Relations 필터링, Date 필터링 기능 검증
type: reference
---

## 검증된 기능

### Database Query 및 Relations
- [FACT] Notion API는 Database Query를 통해 특정 DB의 모든 레코드 조회 가능
- [FACT] Relations 필드는 UUID 기반 "contains", "does_not_contain" 필터 연산자 지원
- [LIMITATION] Relations에 25개 이상의 참조가 있으면 API는 25개만 처리
- [IMPLICATION] 역방향 관계 조회 불가능 - 명시적으로 Places를 tripId로 필터링 필요

### Date 필터링
- [FACT] Date 필드에 대해 equals, after, before, on_or_after, on_or_before 조건 지원
- [FACT] 상대 필터도 지원: "next_week", "past_week", "this_week" 등
- [FACT] ISO 8601 형식 사용: "2026-03-16" 또는 "2026-03-16T12:00:00"

## 구현 시 고려사항

1. **관계 설정**: Places DB의 tripId는 Notion Relation으로 설정되어야 함
2. **데이터 페칭 전략**: 서버에서 Trips + Places를 별도로 조회하고 tripId로 필터링하는 것이 효율적
3. **시간대**: Notion의 Date는 타임존 미지정 시 UTC 기본 - 한국 시간대 처리 필요
