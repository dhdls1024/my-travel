// Next.js 내장 MetadataRoute.Manifest 타입으로 /manifest.webmanifest 자동 서빙
// PWA 설치 시 아이콘, 시작 URL, 디스플레이 모드 등을 브라우저에 알려주는 설정
import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "나만의 여행 플래너",
    short_name: "여행 플래너",
    description: "Notion 여행 계획을 지도로 시각화하는 개인용 여행 플래너",
    start_url: "/",
    // standalone: 주소창 없이 네이티브 앱처럼 실행
    display: "standalone",
    background_color: "#ffffff",
    // theme_color: 브라우저 상단 툴바 색상 (Tailwind blue-500)
    theme_color: "#3B82F6",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
