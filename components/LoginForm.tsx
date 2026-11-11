"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { sfx } from "@/lib/sfx";

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

type Mode = "in" | "up" | "link";

export default function LoginForm() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "google" | "password" | "link">("");

  function done() {
    sfx("complete");
    /* full load so middleware bakes the fresh session cookie */
    window.location.href = "/account";
  }

  async function ensureProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert(
      { id: user.id, email: user.email },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  async function google() {
    setError(null);
    setNotice(null);
    setBusy("google");
    sfx("tick");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    setBusy("");
    if (error) {
      sfx("wrong");
      setError(
        error.message.toLowerCase().includes("provider") || error.message.toLowerCase().includes("unsupported")
          ? "Google sign-in isn't switched on yet. Add the Google provider in your Supabase Auth settings, then this button works."
          : error.message
      );
    }
  }

  async function passwordFlow(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy("password");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setBusy("");
        sfx("wrong");
        setError(
          error.message.toLowerCase().includes("confirm")
            ? "This email still needs confirmation — check your inbox for the link, then sign in here."
            : error.message
        );
      } else {
        await ensureProfile();
        done();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/account` },
      });
      setBusy("");
      if (error) {
        sfx("wrong");
        setError(
          error.message.toLowerCase().includes("already")
            ? "An account with this email exists. Sign in instead — or reset through a sign-in link below."
            : error.message
        );
      } else if (!data.session) {
        sfx("complete");
        setNotice(
          `Account created for ${email}. This project asks for email confirmation — open the link in your inbox, then sign in.`
        );
      } else {
        await ensureProfile();
        done();
      }
    }
  }

  async function magicLink() {
    setError(null);
    setNotice(null);
    setBusy("link");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    setBusy("");
    if (error) { sfx("wrong"); setError(error.message); }
    else {
      sfx("complete");
      setNotice(`Sign-in link sent to ${email}. It expires shortly — open it on this device.`);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "link") return magicLink();
    return passwordFlow(e);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="display text-[38px]">{mode === "up" ? "Create account" : "Sign in"}</h1>
      <p className="muted text-[15px] mt-2 leading-relaxed">
        Your attempts and premium status follow you across devices.
      </p>

      <button
        onClick={google}
        disabled={busy !== ""}
        className="btn btn-secondary w-full mt-8"
        aria-busy={busy === "google"}
      >
        <GoogleGlyph />
        {busy === "google" ? "Opening Google…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1" style={{ border: "none", borderTop: "1.5px dashed rgba(32,26,17,0.3)" }} />
        <span className="text-[12px] muted mono">or with email and password</span>
        <hr className="flex-1" style={{ border: "none", borderTop: "1.5px dashed rgba(32,26,17,0.3)" }} />
      </div>

      <form
        onSubmit={submit}
        className="grid gap-3"
        autoComplete={mode === "up" ? "new-password" : "current-password"}
      >
        {mode === "link" ? (
          <p className="text-[13.5px] muted leading-relaxed">
            No password needed — we send a one-time sign-in link to your email.
          </p>
        ) : null}
        <label className="grid gap-1.5 text-[13px] muted">
          Email
          <input
            type="email" required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="rounded-full px-4 py-3 text-[16px] outline-none"
            style={{ border: "1.5px solid var(--line)", background: "var(--card-bg)", color: "var(--ink)" }}
          />
        </label>

        {mode !== "link" && (
          <label className="grid gap-1.5 text-[13px] muted">
            Password
            <input
              type="password" required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "up" ? "At least 6 characters" : "Your password"}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              className="rounded-full px-4 py-3 text-[16px] outline-none"
              style={{ border: "1.5px solid var(--line)", background: "var(--card-bg)", color: "var(--ink)" }}
            />
          </label>
        )}

        <button className="btn btn-primary mt-1" disabled={busy !== ""} aria-busy={busy === "password"}>
          {busy === "password" ? "One moment…" : mode === "up" ? "Create account" : mode === "link" ? "Email me a sign-in link" : "Sign in"}
        </button>
      </form>

      <div className="mt-5 grid gap-2 text-[13.5px]">
        {mode !== "in" && (
          <button className="link-muted text-left" onClick={() => { setMode("in"); setError(null); setNotice(null); }}>
            Have an account? Sign in
          </button>
        )}
        {mode !== "up" && (
          <button className="link-muted text-left" onClick={() => { setMode("up"); setError(null); setNotice(null); }}>
            New here? Create an account
          </button>
        )}
        {mode !== "link" && (
          <button
            className="link-muted text-left muted underline underline-offset-2"
            style={{ textDecorationColor: "var(--zest)" }}
            onClick={() => magicLink()}
            disabled={busy !== ""}
          >
            Or email me a one-time sign-in link instead
          </button>
        )}
      </div>

      {error && (
        <p className="text-[13.5px] mt-5 p-4 rounded-2xl leading-relaxed"
           style={{ color: "var(--red)", border: "1.5px solid rgba(229,72,77,0.5)", background: "rgba(229,72,77,0.06)" }}>
          {error}
        </p>
      )}
      {notice && (
        <div className="slip p-5 pl-8 mt-5">
          <p className="mono text-[10.5px] tracking-[0.14em]" style={{ color: "var(--muted)" }}>MAIL SENT</p>
          <p className="text-[13.5px] mt-1 leading-relaxed">{notice}</p>
        </div>
      )}

      <p className="text-[12.5px] muted mt-6 leading-relaxed">
        Password sign-up works out of the box. The one-time link needs SMTP configured in your
        Supabase project before launch (the default is rate-limited — add Resend or Postmark).
        Google sign-in needs the Google provider enabled with your OAuth client.
      </p>
    </div>
  );
}
