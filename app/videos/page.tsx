import type { Metadata } from "next";
import VideosIndex from "@/components/VideosIndex";

export const metadata: Metadata = { title: "Videos — Past Graph" };

export default function Page() {
  return <VideosIndex />;
}
