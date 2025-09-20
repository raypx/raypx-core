import type { MetadataRoute } from "next";
import appConfig from "@/config/app.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/", "*.json$"],
      },
      // Allow search engines to crawl all content
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp"],
        allow: ["/", "/en/", "/zh/"],
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${appConfig.url}/sitemap.xml`,
  };
}
