import Logo from "@/components/Logo";
import MathText from "@/components/MathText";

const YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i);
const FREE_FROM = 2021;

export default function Home() {
  return (
    <div>
      {/* ---------------------------------------------------------- */}
      {/* Hero: the ask on the left, the artifact on the right.        */}
      {/* The signature is the exam slip — barcode, serial, stamp.     */}
      {/* ---------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="grid md:grid-cols-[1.08fr_0.92fr] gap-10 md:gap-14 items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="sticker">26 years back</span>
              <span className="sticker sticker-zest">Through 2025</span>
            </div>
            <h1 className="display text-[44px] sm:text-[72px] mt-5">
              Every JAMB question, connected.
            </h1>
            <p className="muted max-w-[54ch] mt-5 text-[17px] sm:text-[19px] leading-relaxed">
              Answer one UTME question and its live column follows: videos, sims and articles threaded
              to the exact topic you&apos;re touching. Like the exam itself — full screen, one thing at a time.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/practice" className="btn btn-primary text-[16px] px-7 py-3.5">Start practising free</a>
              <a href="/videos" className="btn btn-secondary text-[16px] px-6 py-3.5">Watch a timestamped explainer</a>
            </div>
          </div>

          {/* The exam slip (signature) */}
          <div className="relative max-w-md w-full mx-auto md:ml-auto md:mr-0">
            <div className="slip p-6 pl-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mono text-[11px] tracking-[0.14em]" style={{ color: "var(--muted)" }}>
                    PAST GRAPH — UTME REGISTRY
                  </p>
                  <p className="mono text-[15px] font-semibold mt-1">NO&nbsp;2025-0748-014</p>
                </div>
                <span className="sticker sticker-ink" style={{ transform: "rotate(6deg)" }}>FREE ENTRY</span>
              </div>
              <div className="barcode mt-5" role="img" aria-label="Serial barcode" />
              <div className="grid grid-cols-3 gap-x-2 gap-y-3 mt-5">
                {[
                  ["SUBJECT", "Physics"],
                  ["YEAR", "2025"],
                  ["Q No.", "14"],
                  ["PAPER", "Objective"],
                  ["KEYS", "A–d + N/P"],
                  ["STATUS", "Unlocked"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="mono text-[9.5px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>{k}</p>
                    <p className="mono text-[13.5px] font-semibold mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <hr className="tear" />
              <p className="mono text-[10.5px]" style={{ color: "var(--muted)" }}>
                Keep this slip. The archive remembers every question you meet.
              </p>
            </div>
            {/* playful sticker riding the slip's corner */}
            <span
              className="sticker absolute -right-3 -bottom-4 text-[13px]"
              style={{ background: "var(--zest)", color: "#fff7ed", transform: "rotate(8deg)" }}
            >
              No. 014 ✓
            </span>
          </div>
        </div>

        {/* Year rail: lime means free, outlined means the ₦750 archive. Real info, not decoration. */}
        <div className="mt-14">
          <div className="flex flex-wrap gap-2">
            {YEARS.map((y) => (
              <span
                key={y}
                className="mono text-[12px] font-semibold px-3 py-1.5 rounded-full"
                style={
                  y >= FREE_FROM
                    ? { background: "var(--leaf)", border: "1.5px solid var(--line)", color: "var(--ink)" }
                    : { border: "1.5px solid var(--line)", color: "var(--ink)", background: "transparent" }
                }
              >
                {y}
              </span>
            ))}
          </div>
          <p className="muted text-[13.5px] mt-3">
            <span className="inline-block w-3 h-3 rounded-full align-[-1px] mr-1.5" style={{ background: "var(--leaf)", border: "1.5px solid var(--line)" }} />
            Lime years are free to practice now. The outlined archive (2000–2020) is one ₦750 subscription.
          </p>
        </div>
      </section>

      {/* Two doors in */}
      <section style={{ background: "var(--paper-2)", borderTop: "1.5px solid var(--line)", borderBottom: "1.5px solid var(--line)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid md:grid-cols-2 gap-5">
          <a href="/practice" className="card p-7 hover:-translate-y-0.5 transition-transform">
            <span className="chip chip-soft">Start with a question</span>
            <h2 className="display text-[27px] mt-4">Practise, then wander.</h2>
            <p className="muted text-[15px] mt-2.5 leading-relaxed">
              Each question keeps a live column of videos, sims and articles in step with its topic.
              One button returns you to the exact question you left.
            </p>
            <p className="mt-5 font-semibold text-[15px]">Open the stream</p>
          </a>
          <a href="/videos" className="card p-7 hover:-translate-y-0.5 transition-transform">
            <span className="chip chip-soft">Start with a video</span>
            <h2 className="display text-[27px] mt-4">Surf, don&apos;t scroll.</h2>
            <p className="muted text-[15px] mt-2.5 leading-relaxed">
              Reach a timestamp and a pill docks below the player. Tap it: the matching simulation opens
              beside the running video — 60/40 on a wide screen, stacked upright on a phone.
            </p>
            <p className="mt-5 font-semibold text-[15px]">Browse the index</p>
          </a>
        </div>
      </section>

      {/* Constructive questions */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <h2 className="display text-[34px] sm:text-[44px]">Answers are built, not guessed.</h2>
            <p className="muted text-[15.5px] mt-4 leading-relaxed max-w-[58ch]">
              Where it helps, a question unfolds as steps: the equation assembling, the bridge rebuilding,
              the world reacting to your last move. You tap the next meaningful step with your own
              intuition ahead of it.
            </p>
            <a href="/practice?mode=wander&constructive=1" className="btn btn-secondary mt-6">Try a constructive question</a>
            <a href="/feed" className="btn btn-link mt-6">Walk the graph feed →</a>
          </div>
          <div className="slip p-5 sm:p-6 pl-8">
            <div className="flex items-center gap-2 mono text-[11px]" style={{ color: "var(--muted)" }}>
              <span className="pulse-dot" style={{ width: 9, height: 9, background: "var(--zest)", borderRadius: 99, display: "inline-block" }} />
              STEP 3 OF 5
            </div>
            <p className="mt-3 text-[15.5px] font-semibold">Resolve the launch velocity</p>
            <MathText className="mt-1.5 text-[15px] muted leading-relaxed" text="A ball leaves the ground at 40 m/s, 45°. Split it first: vertical $v_y = v\sin\theta$." />
            <MathText className="mt-2.5 text-[18px]" text="$v_y = 40 \times 0.707 = 28.3\,\text{m/s}$" />
            <div className="mt-5 h-2 rounded-full overflow-hidden" style={{ background: "var(--paper-2)", border: "1px solid rgba(32,26,17,0.25)" }}>
              <div className="h-full rounded-full" style={{ width: "60%", background: "var(--zest)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Pathfinder + Sims */}
      <section style={{ background: "var(--paper-2)", borderTop: "1.5px solid var(--line)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid md:grid-cols-2 gap-5">
          <a href="/pathfinder" className="card p-7 hover:-translate-y-0.5 transition-transform">
            <span className="chip chip-leaf">Pathfinder</span>
            <h2 className="display text-[27px] mt-4">Know your combination before it costs you a year.</h2>
            <p className="muted text-[15px] mt-2.5 leading-relaxed">
              Search a career or course and Pathfinder returns the UTME subject trio, the O&apos;level
              caveat and the traps — grounded in the brochure, not vibes.
            </p>
          </a>
          <a href="/sims" className="card p-7 hover:-translate-y-0.5 transition-transform">
            <span className="chip chip-leaf">Sims lab</span>
            <h2 className="display text-[27px] mt-4">Play the physics instead of watching it.</h2>
            <p className="muted text-[15px] mt-2.5 leading-relaxed">
              Projectile motion, waves, Ohm&apos;s law — live canvases that re-plot the instant a slider
              moves. They open beside questions and videos.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
