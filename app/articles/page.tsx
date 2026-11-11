import type { Metadata } from "next";
import ArticlesIndex from "@/components/ArticlesIndex";

export const metadata: Metadata = { title: "Articles — Past Graph" };

export default function Page() {
  return <ArticlesIndex />;
}
