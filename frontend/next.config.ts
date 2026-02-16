import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Route Handlersでバックエンドへのプロキシを実装（cookieを正しく転送するため）
    // rewritesは使わない（Set-Cookieヘッダーが正しく転送されないため）
    devIndicators: false,
    // 本番用
    eslint: {
        ignoreDuringBuilds: true,
    },

    // 本番用: standalone モードで軽量な独立実行可能サーバーを生成
    output: "standalone",

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
