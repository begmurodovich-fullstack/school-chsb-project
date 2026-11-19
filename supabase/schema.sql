-- Supabase > SQL Editor ga joylab, Run bosing.
create table if not exists public.user_data (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;
create policy "faqat o'z ma'lumoti" on public.user_data
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
