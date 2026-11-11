import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 py-28 text-center">
      <p className="chip" style={{ margin: "0 auto" }}>404</p>
      <h1 className="display text-[34px] mt-4">That page slipped off the graph.</h1>
      <p className="muted text-[15px] mt-3">
        The link may be stale. Every destination is one hop away:
      </p>
      <div className="mt-7 flex flex-wrap gap-2 justify-center">
        {[
          ["/practice", "Practice"],
          ["/articles", "Articles"],
          ["/videos", "Videos"],
          ["/sims", "Sims lab"],
          ["/pathfinder", "Pathfinder"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="btn btn-secondary">{label}</Link>
        ))}
      </div>
    </div>
  );
}
