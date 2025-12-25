import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway 배포를 위한 standalone 모드
  output: "standalone",
};

export default nextConfig;
