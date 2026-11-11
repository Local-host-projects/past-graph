import { Suspense } from "react";
import type { Metadata } from "next";
import PracticeApp from "@/components/PracticeApp";

export const metadata: Metadata = { title: "Practice — Past Graph" };

export default function Page() {
  return (
    <Suspense fallback={<p className="max-w-3xl mx-auto px-6 py-16 muted text-[14px]">Loading the hall…</p>}>
      <PracticeApp />
    </Suspense>
  );
}
