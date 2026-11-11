import type { Metadata } from "next";
import FeedApp from "@/components/FeedApp";

export const metadata: Metadata = {
  title: "Graph feed — Past Graph",
  description: "A vertical walk through the weakest threads of your graph: questions, videos, sims and articles, ranked and diversified.",
};

export default function Page() {
  return <FeedApp />;
}
