import type { Metadata } from "next";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "Offline — Past Graph" };

export default function Offline() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="slip p-8 pl-9">
        <div className="flex justify-center"><Logo className="h-10 w-10" /></div>
        <h1 className="display text-[28px] mt-4">You&apos;re offline</h1>
        <p className="muted text-[15px] mt-2 leading-relaxed">
          The questions live in the registry, and the registry needs a connection right now. Pages you
          already opened keep working; the rest return the moment you&apos;re back online.
        </p>
        <a href="/" className="btn btn-primary mt-6">Try again</a>
      </div>
    </div>
  );
}
