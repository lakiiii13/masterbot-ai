-- Tabela za sve generisane objave (Facebook, Instagram, LinkedIn...)
create table if not exists generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  platform text not null default 'facebook',
  content text not null,
  prompt text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indeksi za brže pretraživanje
create index if not exists idx_generated_posts_platform on generated_posts(platform);
create index if not exists idx_generated_posts_created_at on generated_posts(created_at desc);
create index if not exists idx_generated_posts_user_id on generated_posts(user_id);

-- RLS
alter table generated_posts enable row level security;

-- Dozvoli insert svima (anon + auth)
create policy "Allow insert" on generated_posts for insert with check (true);

-- Dozvoli read svima (kasnije možeš ograničiti na user_id kada dodaš auth)
create policy "Allow read" on generated_posts for select using (true);
