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
        "/courses/new",
        "/courses/*/offerings/new",
        "/courses/*/offerings/*/reviews/new",
        "/login",
        "/register",
        "/posts",
      ],
    },
    sitemap: "https://tgline.dev/sitemap.xml",
  };
}
