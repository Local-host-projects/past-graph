import type { Metadata } from "next";
import PathfinderApp from "@/components/PathfinderApp";

export const metadata: Metadata = { title: "Pathfinder — Past Graph" };

export default function Page() {
  return <PathfinderApp />;
}
