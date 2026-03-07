import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/settings",
        "/posts/new",
        "/posts/*/edit",
        "/login",
        "/register",
        "/posts",
      ],
    },
    sitemap: "https://tgline.dev/sitemap.xml",
  };
}