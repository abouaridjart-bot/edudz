import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

/** الصفحات العامة فقط — لا تُدرج مساحات المركز/الطالب/المشرف في خريطة الموقع. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/curriculum`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/exams`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
