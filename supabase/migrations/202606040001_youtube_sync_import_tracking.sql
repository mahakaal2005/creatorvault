create type public.content_source as enum ('manual', 'youtube_sync');

alter table public.content_items
  add column source public.content_source not null default 'manual',
  add column source_account_id uuid references public.platform_accounts(id) on delete set null,
  add column last_synced_at timestamptz;

create index content_items_user_source_idx
  on public.content_items (user_id, source);

create index content_items_user_external_id_idx
  on public.content_items (user_id, platform, external_id)
  where external_id is not null;

drop policy if exists "Users can read own platform accounts" on public.platform_accounts;
drop policy if exists "Users can insert own platform accounts" on public.platform_accounts;
drop policy if exists "Users can update own platform accounts" on public.platform_accounts;
drop policy if exists "Users can delete own platform accounts" on public.platform_accounts;
