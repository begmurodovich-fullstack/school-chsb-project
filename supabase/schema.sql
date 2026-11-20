-- Supabase > SQL Editor ga joylab, Run bosing.
create table if not exists public.user_data (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Ruxsatlar (PostgreSQL ruxsatlarini berish)
grant all on table public.user_data to authenticated;
grant all on table public.user_data to anon;
grant all on table public.user_data to service_role;

alter table public.user_data enable row level security;

-- Har bir o'qituvchi faqat o'z ma'lumotlarini ko'radi va o'zgartiradi
drop policy if exists "faqat o'z ma'lumoti" on public.user_data;
create policy "faqat o'z ma'lumoti" on public.user_data
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
