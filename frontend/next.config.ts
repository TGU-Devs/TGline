import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    output: "standalone",

    // /api/* へのリクエストをRails APIに転送
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.BACKEND_URL || "http://backend:3000"}/api/:path*`,
            },
        ];
    },

    webpack: (config) => {
        config.watchOptions = {
            poll: 100,
            aggregateTimeout: 300,
        };
        return config;
    },
};

export default nextConfig;
