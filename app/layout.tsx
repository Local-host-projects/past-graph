import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import Logo from "@/components/Logo";
import SoundToggle from "@/components/SoundToggle";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const spline = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Past Graph — Every JAMB question, connected",
  description:
    "The complete catalog of GCE/JAMB (UTME) past questions from 2000–2025, threaded into articles, live simulations and the best YouTube explainers on every path.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Past Graph",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e4",
};

const navLinks = [
  { href: "/practice", label: "Practice" },
  { href: "/feed", label: "Feed" },
  { href: "/videos", label: "Videos" },
  { href: "/articles", label: "Articles" },
  { href: "/sims", label: "Sims" },
  { href: "/pathfinder", label: "Pathfinder" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} ${spline.variable}`}>
      <body>

        {/* Floating pill chrome — content slides underneath it */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-16px)]">
          <nav
            className="glass-ink rounded-full pl-4 pr-2.5 h-12 flex items-center gap-1 overflow-x-auto no-scrollbar"
            style={{ boxShadow: "3px 4px 0 rgba(32,26,17,0.25)" }}
            aria-label="Main"
          >
            <a href="/" aria-label="Past Graph home" className="flex items-center gap-2 pr-3 shrink-0">
              <Logo className="h-6 w-6" />
              <span className="text-[15px] font-semibold tracking-tight whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                Past Graph
              </span>
            </a>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="pill-link">
                {l.label}
              </a>
            ))}
            <span aria-hidden="true" className="w-px h-5 mx-1 shrink-0" style={{ background: "rgba(245,240,228,0.25)" }} />
            <a href="/search" className="pill-link shrink-0">Search</a>
            <span className="shrink-0"><SoundToggle /></span>
            <a
              href="/account"
              className="shrink-0 ml-1 rounded-full px-4 py-1.5 text-[13.5px] font-semibold"
              style={{ background: "var(--leaf)", color: "var(--ink)", border: "1.5px solid var(--line)" }}
            >
              Account
            </a>
          </nav>
        </div>

        <main className="pt-[64px] min-h-[calc(100vh-64px)]">{children}</main>

        <footer className="mt-20" style={{ borderTop: "1.5px solid var(--line)" }}>
          <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] muted">
            <span className="flex items-center gap-2">
              <Logo className="h-5 w-5" />
              <span>© {new Date().getFullYear()} Past Graph. Questions are reconstructed for study.</span>
            </span>
            <div className="flex gap-6">
              <a href="/pricing" className="link-muted">Premium</a>
              <a href="/pathfinder" className="link-muted">Pathfinder</a>
              <a href="/account" className="link-muted">Account</a>
            </div>
          </div>
        </footer>

        <RegisterSW />
      </body>
    </html>
  );
}
