import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/curriculum", "/exams", "/lessons/"],
      disallow: ["/admin/", "/center/", "/student/", "/parent/", "/teacher/", "/api/", "/activate", "/login"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
