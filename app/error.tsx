"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto px-6 py-28 text-center">
      <p className="chip" style={{ margin: "0 auto" }}>Something broke</p>
      <h1 className="display text-[32px] mt-4">That wasn&apos;t supposed to happen.</h1>
      <p className="muted text-[14.5px] mt-3">
        The page hit an error — nothing you wrote was lost. Try again, and if it keeps happening, come back through
        the exercise reel.
      </p>
      <button className="btn btn-primary mt-7" onClick={reset}>Try again</button>
    </div>
  );
}
