---
name: 여행 플래너 MVP PRD 검증 결과
description: 기술적 타당성, 복잡도, 아키텍처 리스크 종합 평가
type: project
---

## 검증 일시
- 2026-03-16

## 최종 판정
**⚠️ 조건부 통과: 수정 후 구현 가능**

기술적으로 대부분 실현 가능하나, Notion DB 설계 상세화와 에러 처리 로직이 필요함.

## 기술 스택 평가

### 확인된 호환성
- [VERIFIED] Notion API: Database Query, Relations, Date 필터링 모두 지원
- [VERIFIED] Next.js 16: ISR + on-demand revalidation 완벽 지원
- [VERIFIED] 기존 기술 스택: TypeScript, React 19, Tailwind 4, shadcn/ui와 완벽 호환

### 불확실한 부분
- [UNCERTAIN] react-kakao-maps-sdk: 공식 문서 접근 불가능 (일반적 지도 기능은 지원할 것으로 예상)
- [UNCERTAIN] Kakao Maps API: 정확한 마커/팝업 기능 범위

## 구현 복잡도

### 기능별 예상 시간
| 기능 | 난이도 | 예상 시간 | 주요 도전 |
|------|--------|----------|----------|
| 여행 목록 | 2/5 | 2-3일 | Notion ISR 캐싱 |
| 여행 대시보드 | 4/5 | 4-5일 | 필터링 로직, 상태 관리 |
| 지도 페이지 | 4/5 | 3-4일 | Kakao Maps 라이브러리 학습 |
| Notion 통합 | 3/5 | 2-3일 | 관계 설정, 데이터 매핑 |
| API 재검증 | 2/5 | 1일 | revalidatePath() 호출 |
| 타입/유틸리티 | 1/5 | 1일 | - |

**총 예상 시간: 13-18일 (2-3주)**
**1인 개발자 권장 일정: 3-4주 (버퍼 포함)**

## 주요 리스크

### 🔴 Critical Issues (즉시 수정 필요)

**Issue #1: Notion 관계 설계 불명확**
```
문제: PRD에서 Places 테이블의 tripId가 Notion Relation으로 설정되는지 명확하지 않음
영향: 데이터 모델 구현 단계에서 혼란 가능
해결: PRD에 다음 명시 필요:
1. Trips DB에 "여행" 페이지들 저장
2. Places DB에 "장소" 페이지들 저장, tripId 필드는 Trips DB에 대한 Relation
3. Notion 쿼리 예시: Places를 tripId로 필터링하는 API 호출 구조
근거: Notion API 문서 (Relations는 UUID 기반 "contains" 필터 사용)
```

**Issue #2: 시간대(Timezone) 처리 누락**
```
문제: Notion Date 필드와 클라이언트의 시간대 불일치 가능성
영향: 날짜 필터링 시 하루 오차 가능 (한국 시간대 vs UTC)
예시: Notion에 "2026-03-16"으로 저장된 date-fns 라이브러리 처리 시 서버 시간대에 따라 "2026-03-15"로 해석될 수 있음
해결:
1. date-fns 사용 시 명시적으로 시간대 설정 (UTC+9 한국 시간)
2. Notion에서 Date 필드의 시간대 명확화
근거: Notion API 문서 (Date 필드는 ISO 8601 형식, 타임존 미지정 시 UTC)
```

### 🟡 Major Issues (개발 전 개선 권장)

**Issue #1: 에러 처리 및 재시도 로직 누락**
```
문제: Notion API 호출 실패 시 재시도 로직이 없음
영향: 네트워크 불안정 시 일시적 실패로 페이지 렌더링 실패
해결:
1. lib/notion.ts에 fetch retry 로직 추가 (최소 2회 재시도, exponential backoff)
2. 최종 실패 시 사용자에게 sonner 토스트로 알림
3. ISR 캐시가 있으면 캐시 사용, 없으면 에러 화면 표시
근거: API 안정성 모범 사례
```

**Issue #2: Places 대규모 데이터 처리 전략 부재**
```
문제: 현재는 전체 Places를 조회한 후 클라이언트에서 필터링
영향: Places가 1000개 이상일 경우 메모리/성능 저하, 초기 로딩 지연
현상황: MVP에서는 여행당 10-50개 장소로 예상되므로 무방
미래 계획: POST /api/places?tripId=xxx&category=xxx 엔드포인트로 서버사이드 필터링 전환
근거: React Query + 서버 필터링 모범 사례
```

**Issue #3: Kakao Maps 라이브러리 검증 불완전**
```
문제: react-kakao-maps-sdk 공식 문서 접근 불가능
영향: 정확한 API, 마커 클릭 이벤트, InfoWindow 구현 방식 불명확
현상황: 일반적 지도 라이브러리 기능으로는 지원할 것으로 예상되나 100% 확신 불가능
권장:
1. 개발 초기에 간단한 POC 코드 작성해 기능 검증
2. 필요시 공식 Kakao Maps JS API 직접 사용으로 전환 가능 (더 안정적)
근거: 라이브러리 의존성 관리 원칙
```

### 🟢 Minor Suggestions (선택적 개선)

**Suggestion #1: 접근성(Accessibility) 추가**
```
개선: 지도의 마커, 탭 네비게이션, 필터 버튼에 ARIA 라벨 추가
효과: 스크린 리더 사용자 지원, 웹 접근성 표준 준수
난이도: 낮음 (shadcn/ui 컴포넌트 자동 제공)
우선순위: MVP 이후 개선
```

**Suggestion #2: 로딩 상태 UX 개선**
```
개선: Skeleton 로딩 상태를 더 구체적으로 설계 (카드, 탭, 필터 각각)
효과: 사용자 대기 시간에 대한 인식 감소
난이도: 낮음-중간
우선순위: 개발 중 조정 가능
```

**Suggestion #3: 오프라인 지원 검토 (향후)**
```
개선: Service Worker + IndexedDB로 최근 조회한 여행 캐싱
효과: 인터넷 끊김 상황에서도 기본 기능 사용 가능
난이도: 높음
우선순위: MVP 이후 (현재는 제외 대상)
```

## 데이터 모델 평가

### ✅ 장점
- [VERIFIED] Trips ↔ Places 관계 설계는 Notion API와 호환
- [VERIFIED] 필드 타입들이 Notion에서 지원하는 타입
- [VERIFIED] D-Day 계산은 startDate에서 date-fns로 쉽게 구현 가능

### ⚠️ 개선 필요
- [MISSING] Notion에서의 정확한 필드 설정 방식 명시 필요
- [MISSING] 예상 데이터 볼륨 범위 명시 (장소 수, 여행 수)
- [MISSING] 장소 카드의 "rating" 필드 관리 방식 (1-5 Star, Select 등)

## 아키텍처 의견

### ISR 캐싱 전략
**평가: 타당함**
- revalidate: 60으로 설정하면 최대 60초 지연
- 새로고침 버튼으로 on-demand revalidation 가능
- 사용자가 능동적으로 갱신할 수 있으므로 UX 우수

### 동적 라우팅
**평가: 적절함**
- generateStaticParams()로 기존 여행들 사전 생성
- 새 여행은 첫 접근 시 동적 생성 (ISR)
- Vercel은 완벽 지원

### 클라이언트 필터링
**평가: MVP에는 무방, 향후 개선 필요**
- 현재: TanStack Query로 클라이언트 상태 관리
- 문제: 데이터 커질수록 메모리 사용 증가
- 권장: 향후 서버사이드 필터링 엔드포인트로 전환

## 검증 완료 여부

### 공식 문서 기반 검증
- ✅ Notion API: Database Query, Relations, Date 필터 - 완벽 검증
- ✅ Next.js 16: ISR, on-demand revalidation - 완벽 검증
- ⚠️ react-kakao-maps-sdk: 문서 접근 불가능 - 불완전한 검증 (일반적 가정에 기반)

### 추가 검증 필요 영역
1. Kakao Maps 마커 클릭/팝업 기능 (POC 코드로 검증)
2. Notion 관계 설정 방식 (개발 초기 단계에서 실제 구현으로 검증)
3. 시간대 처리 방식 (date-fns 라이브러리 테스트)

## 최종 권장사항

### 개발 진행 전 완료 필요
1. ✅ Notion DB 설계 상세화 (Relations 명시)
2. ✅ 시간대 처리 전략 정의 (UTC+9 한국)
3. ✅ 에러 처리 및 재시도 로직 추가
4. ✅ Kakao Maps 간단한 POC 작성

### 개발 일정
- **착수**: 위 4가지 완료 후 진행 권장
- **기간**: 3-4주 (일정 여유 포함)
- **마일스톤**:
  - Week 1: Notion 통합 + 여행 목록 페이지
  - Week 2: 여행 대시보드 + 필터링
  - Week 3: 지도 페이지 + 통합 테스트
  - Week 4: 버그 수정, 성능 최적화, 배포

### 기술적 판정
**최종 판정: ⚠️ 조건부 통과 → 수정 후 구현 가능**

- 기술적 기반은 견고함
- Critical Issues 해결 시 구현 가능
- 1인 개발자가 3-4주 내 완성 가능
- 외부 API 의존성(Notion, Kakao) 관리 필요
