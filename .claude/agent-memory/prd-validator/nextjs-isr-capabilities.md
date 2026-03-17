---
name: Next.js 16 ISR 및 캐싱 기능
description: Next.js의 ISR, on-demand revalidation, revalidatePath() 기능 검증
type: reference
---

## 검증된 기능

### ISR (Incremental Static Regeneration)
- [FACT] Next.js 16에서 fetch() 시 { next: { revalidate: 60 } } 옵션으로 ISR 구현
- [FACT] 지정된 초 단위로 시간 기반 재검증 (stale-while-revalidate 방식)
- [BEHAVIOR] 캐시 만료 후 첫 요청은 캐시된 데이터 반환, 백그라운드에서 새 데이터 페칭

### On-demand Revalidation
- [FACT] revalidatePath('/travel') - 경로 기반 캐시 무효화
- [FACT] revalidateTag('tag-name') - 태그 기반 캐시 무효화
- [FACT] Route Handler에서 revalidatePath() 호출 가능
- [FACT] Server Action에서도 호출 가능 (Router Cache도 함께 무효화)

### 동적 라우팅 ([tripId])
- [FACT] generateStaticParams()로 빌드 타임에 알려진 경로 사전 생성 가능
- [FACT] 미리 생성되지 않은 동적 경로는 첫 요청 시 ISR로 생성
- [FACT] Vercel은 on-demand ISR을 완벽하게 지원

## 여행 플래너 적용 방식

1. **데이터 페칭**: `fetch(Notion API, { next: { revalidate: 60 } })`
2. **새로고침 버튼**: Route Handler에서 `revalidatePath('/travel/[tripId]')` 호출
3. **즉시 반영**: revalidatePath() 호출 후 Data Cache 무효화 → 다음 요청 시 Notion 재조회

## 주의사항

- [LIMITATION] revalidatePath()는 Route Handler에서 호출 시 Router Cache를 즉시 무효화하지 않음
- [SOLUTION] 클라이언트에서 router.refresh()와 함께 사용하거나, Server Action에서 호출 권장
