import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Route Handlersでバックエンドへのプロキシを実装（cookieを正しく転送するため）
    // rewritesは使わない（Set-Cookieヘッダーが正しく転送されないため）
    devIndicators: false,

    // Windowsでのホットリロード対応
    webpack: (config) => {
        config.watchOptions = {
            poll: 100,
            aggregateTimeout: 300,
        };
        return config;
    },
};

export default nextConfig;
