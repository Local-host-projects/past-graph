-- Past Graph — production upgrade (run in Supabase SQL editor AFTER schema.sql)
-- Adds: payments ledger, manual bank-transfer claims.

-- ================================================================== PAYMENTS
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reference   text not null unique,
  method      text not null default 'card_or_transfer' check (method in ('card_or_transfer','card','transfer','claim')),
  amount      integer not null,
  status      text not null default 'pending' check (status in ('pending','success','failed')),
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "read own payments"  on public.payments for select to authenticated using (auth.uid() = user_id);
create policy "insert own payment" on public.payments for insert to authenticated with check (auth.uid() = user_id and status = 'pending');
-- No update policy: success flips happen server-side (webhook / verify route, service role).

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

-- ================================================================== MANUAL BANK-TRANSFER CLAIMS
create table if not exists public.transfer_claims (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reference   text not null unique,
  payer_name  text not null,
  bank        text,
  amount      integer not null check (amount = 750),
  status      text not null default 'pending' check (status in ('pending','approved','rejected','done')),
  admin_note  text,
  claimed_ip  text,
  created_at  timestamptz not null default now()
);

alter table public.transfer_claims enable row level security;

create policy "read own claim"   on public.transfer_claims for select to authenticated using (auth.uid() = user_id);
create policy "insert own claim" on public.transfer_claims for insert to authenticated
  with check (auth.uid() = user_id and status = 'pending');
-- Approval/rejection: Supabase Studio (service role) sets status; then run grantPremium server-side.

create index if not exists claims_user_idx on public.transfer_claims (user_id, created_at desc);
create index if not exists claims_status_idx on public.transfer_claims (status) where status = 'pending';
