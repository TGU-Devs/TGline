import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/settings", "/posts/new", "/posts/*/edit"],
    },
    sitemap: "https://tgline.dev/sitemap.xml",
  };
}
