# Vercel setup — Past Graph

The app is a standard Next.js (App Router) project with no server beyond Vercel
functions and Supabase. Deploy is import-and-go; the only discipline is
environment variables, because every `NEXT_PUBLIC_*` value is **build-time** —
changing one requires a redeploy to reach the client bundle.

## 1. Import the repo

1. Push is already at `https://github.com/Local-host-projects/past-graph.git` (`main`).
2. vercel.com/new → import `Local-host-projects/past-graph`.
3. Framework: Next.js (auto-detected from `vercel.json`). Region: `fra1` (closest
   edge region for Nigeria of Vercel's EU regions).

## 2. Environment variables (Production **and** Preview)

| Name | Value | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://odzeuyonqwjwvjnglghz.supabase.co` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Supabase → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_…` (server-only) | Supabase → API → Secret key |
| `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` | **Set after the first deploy** (below) |
| `AI_API_KEY` | Gemini API key | aistudio.google.com |
| `GEMINI_MODEL` | `gemini-2.5-flash` (optional) | — |
| `PAYSTACK_SECRET_KEY` | `sk_test_…` / `sk_live_…` | only if Paystack stays the provider |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_…` | only if Paystack stays the provider |
| `FLW_SECRET_KEY` | `FLWSECK-…` | Flutterwave → Settings → API |
| `FLW_SECRET_HASH` | the string typed into the webhook settings | Flutterwave → Settings → Webhooks |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | `flutterwave` | only when switching to Flutterwave |
| `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` / `_NAME` / `_NAME`… | manual claim card | optional — shows the manual transfer form on /pricing |

Notes:
- **Provider switch:** unset → Paystack; `flutterwave` → Flutterwave. Both stacks
  are live in the code; the switch is build-time.
- `SUPABASE_SERVICE_ROLE_KEY` must exist or premium flips, claims, and
  webhooks all fail with 503.

## 3. After the first deploy

1. Set `NEXT_PUBLIC_APP_URL` to the deployed URL (e.g. `https://past-graph.vercel.app`)
   and redeploy. This URL feeds payment redirect/callbacks, the sitemap, and robots.
2. Custom domain later? Add it in Vercel → Settings → Domains, then update
   `NEXT_PUBLIC_APP_URL` again and redeploy.

## 4. Supabase auth config

Supabase → Authentication → URL Configuration:
- **Site URL:** the deployed URL.
- **Redirect URLs:** add the deployed domain (and the custom domain when added).
  localhost entries can stay for dev.

## 5. Payment webhooks (post-deploy, once the domain is known)

- **Flutterwave:** Dashboard → Settings → Webhooks → URL
  `https://<domain>/api/webhooks/flutterwave`, and the **Secret hash** there must
  equal the `FLW_SECRET_HASH` env var. Test-mode charges fire test webhooks.
- **Paystack:** Dashboard → Settings → Webhooks → URL
  `https://<domain>/api/webhooks/paystack` (secret key doubles as the HMAC key).

## 6. Database before first traffic

Run `supabase/upgrade.sql` in the Supabase SQL editor if not already run — it
adds the payments ledger, claims, the `blanks` question kind, and the new sim
kinds. Then locally (with the production URL/keys in `.env.local`):
`node scripts/expand-content.mjs --go` to seed the new content.

## 7. First-run checklist

- `/pricing` loads; a test-mode transaction reaches the hosted page and returns
  to `/pricing/success?…` with premium flipped (verify route → profile update).
- Transfer path: start a bank-transfer checkout, "pay" in the provider's test
  flow, and confirm the webhook flips premium (or the verify endpoint does).
- `/practice`, `/watch/<videoId>`, `/beat?q=…&w=…` all render; PWA install works
  over HTTPS.
