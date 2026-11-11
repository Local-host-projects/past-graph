import type { Metadata } from "next";
import CheckoutSection from "@/components/CheckoutSection";

export const metadata: Metadata = { title: "Premium — Past Graph" };

const included = [
  "Every question 2000–2025 (five recent years always free)",
  "Constructive multi-step questions with step-by-step reveals",
  "Live recommendation column while you practise",
  "Timestamped YouTube pop-ups with side-by-side simulations",
  "Sims lab: projectile motion, waves, Ohm's law",
  "Pathfinder subject-combination advisor",
  "All six months of the UTME season, one payment",
];

export default function Pricing() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
      <div className="text-center">
        <p className="chip" style={{ margin: "0 auto" }}>Past Graph Premium</p>
        <h1 className="display text-[38px] sm:text-[54px] mt-4">₦750.<br />The whole season.</h1>
        <p className="muted text-[16px] mt-3 max-w-[52ch] mx-auto leading-relaxed">
          One payment covers six months — the length of a UTME cycle. No renewal traps, no per-subject fees.
          Five recent years stay free forever.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="text-[20px] font-semibold tracking-tight">Free</h2>
          <p className="text-[13px] muted mt-0.5">No account required to start</p>
          <p className="display text-[40px] mt-4">₦0</p>
          <ul className="mt-4 grid gap-2 text-[14px]">
            <li>2021–2025 questions</li>
            <li>All articles and video annotations</li>
            <li>Sims lab</li>
            <li>Pathfinder combinations</li>
          </ul>
          <a href="/practice" className="btn btn-secondary w-full mt-6">Start free</a>
        </div>

        <div className="card p-6" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 18px 50px rgba(0,113,227,0.18)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-semibold tracking-tight">Premium</h2>
              <p className="text-[13px] muted mt-0.5">Six months · one payment</p>
            </div>
            <span className="chip" style={{ background: "rgba(0,113,227,0.1)", color: "var(--accent)" }}>Recommended</span>
          </div>
          <p className="display text-[40px] mt-4">₦750</p>
          <ul className="mt-4 grid gap-2 text-[14px]">
            {included.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <CheckoutSection />
        </div>
      </div>

      <div className="card-flat p-5 mt-6 text-[13.5px] muted leading-relaxed">
        <strong className="text-[var(--ink)]">Why ₦750 and not ₦500?</strong> Processor fees take a larger relative bite
        out of ₦500, and ₦750 still reads as pocket money against a full season of premium prep. Launch discounts can
        come later — the anchor shouldn&apos;t start low.
      </div>
    </div>
  );
}
