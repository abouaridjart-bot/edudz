import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/curriculum`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/exams`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];
}
