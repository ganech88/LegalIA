import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://legalia.com.ar";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/herramientas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/herramientas/indemnizacion-despido`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
