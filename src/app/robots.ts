import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/curriculum", "/exams", "/lessons/"],
      disallow: ["/admin/", "/center/", "/student/", "/parent/", "/teacher/", "/api/"],
    },
    sitemap: "/sitemap.xml",
  };
}
