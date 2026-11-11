"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AccountView() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [until, setUntil] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        setEmail(auth.user.email ?? null);
        const { data: p } = await supabase
          .from("profiles")
          .select("is_premium,premium_until")
          .eq("id", auth.user.id)
          .maybeSingle();
        setPremium(Boolean(p?.is_premium));
        setUntil(p?.premium_until ?? null);
        const { data: attempts } = await supabase
          .from("attempts")
          .select("correct")
          .eq("user_id", auth.user.id);
        const total = attempts?.length ?? 0;
        const correct = attempts?.filter((a) => a.correct).length ?? 0;
        setStats({ total, correct });
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <p className="max-w-2xl mx-auto px-6 py-16 muted text-[14px]">Loading…</p>;

  if (!email) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="display text-[36px]">Account</h1>
        <p className="muted text-[15px] mt-2">Sign in to keep your attempts and unlock the archive.</p>
        <a href="/login" className="btn btn-primary mt-5">Sign in</a>
      </div>
    );
  }

  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="display text-[36px]">Account</h1>
      <p className="muted text-[14px] mt-1">{email}</p>

      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] muted">Plan</p>
            <p className="text-[20px] font-semibold tracking-tight mt-0.5">{premium ? "Premium" : "Free"}</p>
            {premium && until && <p className="text-[12.5px] muted mt-0.5">Active until {new Date(until).toLocaleDateString()}</p>}
          </div>
          {!premium && <a href="/pricing" className="btn btn-primary">Get Premium · ₦750</a>}
        </div>
      </div>

      <div className="card p-6 mt-4">
        <p className="text-[13px] muted">Practice</p>
        <div className="mt-2 flex gap-8">
          <div>
            <p className="text-[28px] font-semibold tracking-tight">{stats.total}</p>
            <p className="text-[12.5px] muted">questions answered</p>
          </div>
          <div>
            <p className="text-[28px] font-semibold tracking-tight">{accuracy}%</p>
            <p className="text-[12.5px] muted">accuracy</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="btn btn-secondary" onClick={signOut}>Sign out</button>
        <a href="/practice" className="btn btn-link">Back to practice</a>
      </div>
    </div>
  );
}
