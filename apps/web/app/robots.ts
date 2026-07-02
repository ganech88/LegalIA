import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://legalia.com.ar";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/herramientas"],
        disallow: ["/api/", "/dashboard", "/escritos", "/asistente", "/casos", "/agenda", "/config", "/equipo", "/biblioteca"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
