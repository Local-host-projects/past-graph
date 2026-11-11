import type { Metadata } from "next";
import SearchApp from "@/components/SearchApp";

export const metadata: Metadata = { title: "Search — Past Graph" };

export default function Page() {
  return <SearchApp />;
}
