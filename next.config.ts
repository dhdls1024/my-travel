import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // next/image 외부 이미지 도메인 허용
  images: {
    remotePatterns: [
      {
        // Notion 커버 이미지 (CoverImage URL 필드)
        protocol: "https",
        hostname: "**.notion.so",
      },
      {
        // Notion S3 이미지 호스팅
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        // Unsplash 이미지 (Notion 커버 이미지 소스)
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
