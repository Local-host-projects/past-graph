# Past Graph

Every JAMB/UTME past question 2000–2025, threaded into articles, live simulations and
timestamped YouTube pop-ups. Full-screen reel practice, constructive multi-step questions,
a 400-mark era-accurate assessment, and a Pathfinder advisor.

## Stack

Next.js 15 (App Router) · Tailwind v4 · Supabase (Postgres + Auth + RLS) · Paystack · Gemini (Google Generative Language API) · KaTeX · canvas sims

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Supabase setup (SQL editor, in this order)

1. `supabase/schema.sql` — tables, RLS, `questions.is_free` (generated: `year >= 2021`)
2. `supabase/seed.sql` — subjects, topics, sims, articles, videos, annotations, JAMB combos
3. `supabase/seed_questions.sql` — the question bank (30 per year per subject, era-marked)
4. `supabase/upgrade.sql` — payments ledger + manual transfer claims

Never edit `is_free` by hand — it is a generated column derived from the year.

## Environment (`.env.local`)

| Key | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | everything | from Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | everything | publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | payments, claims | **server-only**, never `NEXT_PUBLIC_*` |
| `GEMINI_API_KEY` *or* `AI_API_KEY` | Pathfinder AI chat, question hints | server-only |
| `GEMINI_MODEL` | optional | default `gemini-2.5-flash` |
| `PAYSTACK_SECRET_KEY` | /api/checkout, webhook, verify | `sk_test_…` first |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | inline checkout popup | `pk_test_…` |
| `NEXT_PUBLIC_APP_URL` | checkout callback URL | e.g. `https://your-app.vercel.app` |
| `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` | manual transfer card on /pricing | shown publicly |
| `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | manual transfer card | shown publicly |

## Payments

- **Card / USSD**: Paystack inline popup on `/pricing` (₦750 = `75000` kobo).
- **Bank transfer (account number)**: the checkout popup's `bank_transfer` channel shows a
  dedicated account number when the business is enabled for dynamic virtual accounts. The
  webhook (`/api/webhooks/paystack`, HMAC-SHA512-verified) flips premium for these — transfers
  have no browser callback. Register the webhook URL in Paystack Dashboard → Webhooks.
- **Manual route**: if dynamic accounts aren't enabled yet, `/pricing` shows the fallback card —
  users pay into the stated account, submit the receipt reference via `/api/claims`, and an
  operator approves in Supabase Studio (`transfer_claims.status = 'approved'`) then runs:
  ```sql
  -- In Supabase Studio: flip the claim, then grant premium server-style
  -- (stacks onto any existing premium_until rather than overwriting it):
  update public.profiles p
     set is_premium = true,
         premium_until = greatest(coalesce(p.premium_until, now()), now()) + interval '6 months'
   where p.id in (select user_id from public.transfer_claims where status = 'approved');
  update public.transfer_claims set status = 'done' where status = 'approved';
  ```
- Premium flips are **always server-side** (`lib/premium.ts` stamps `premium_until` =
  later of now / existing + 6 months). No negative marking in assessment; no client trust.

## Gemini features

| Endpoint | Does |
|---|---|
| `POST /api/ai/chat` | Pathfinder advisor: subject combinations, alternatives, study plan (≤220 words) |
| `POST /api/ai/hint` | one nudge for a question without revealing the answer |

Both are signed-in-only, rate-limited per IP (12 and 20 per 10 min), hard-cap token sizes, and
degrade to explicit `no_key` states instead of erroring the UI.

## Content model

- Five subjects, every year 2025 → 2000, **30 questions per year per subject**.
- Era markers inside explanations: paper era 2000–2014 (100-Q English / ~250 total),
  CBT-250 2015–2016, CBT-180 + 2h + 400 marks from 2017 (official JAMB manual wording).
- Novel lineage (English): Forcados 2015–16 → In Dependence 2017–18 → Sweet Sixteen 2019–21 →
  The Life Changer 2022–25 (Lekki Headmaster flagged for 2026).
- `kind = 'multi'` rows carry a JSONB `steps` array — the constructive step player
  (`{title, kind: text|math|scene, content, note}`).

## Assessment (400 marks)

Era-accurate scoring: electives 2.5 marks/question (40 → 100), English scaled proportionally
(60 → 100), no negative marking, cut-off context per year from the researched tables.

## Production checklist

- [x] Error boundary (`app/error.tsx`), 404 (`app/not-found.tsx`), sitemap, robots
- [x] Service-role client isolated (`utils/supabase/admin.ts`), RLS verified
- [x] Rate limiting on AI endpoints (in-memory; swap for Redis at multi-region scale)
- [x] Webhook HMAC verification, idempotent premium grants
- [ ] Set real env keys; register Paystack webhook URL; switch keys test → live
- [ ] `NEXT_PUBLIC_APP_URL` on the deploy host
