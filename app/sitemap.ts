import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://past-graph.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/practice", "/articles", "/videos", "/sims", "/search", "/pathfinder", "/pricing", "/login"];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: r === "" || r === "/practice" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/practice" ? 0.9 : 0.5,
  }));
}
