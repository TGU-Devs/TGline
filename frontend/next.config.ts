import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Route Handlersでバックエンドへのプロキシを実装（cookieを正しく転送するため）
  // rewritesは使わない（Set-Cookieヘッダーが正しく転送されないため）
};

export default nextConfig;
