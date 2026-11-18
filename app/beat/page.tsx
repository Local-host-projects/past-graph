import { Suspense } from "react";
import type { Metadata } from "next";
import BeatApp from "@/components/BeatApp";

export const metadata: Metadata = { title: "Beat my path — Past Graph" };

export default function Page() {
  return (
    <Suspense fallback={<p className="max-w-3xl mx-auto px-6 py-16 muted text-[14px]">Opening the challenge…</p>}>
      <BeatApp />
    </Suspense>
  );
}
