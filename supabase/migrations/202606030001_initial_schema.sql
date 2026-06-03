create extension if not exists "pgcrypto";

create type public.platform as enum ('youtube', 'instagram');
create type public.content_type as enum (
  'youtube_video',
  'youtube_short',
  'instagram_reel'
);
create type public.content_status as enum ('active', 'archived');
create type public.hook_type as enum (
  'curiosity',
  'problem_solution',
  'story',
  'listicle',
  'challenge',
  'educational',
  'other'
);
create type public.platform_provider as enum ('youtube', 'instagram');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  url text not null check (length(btrim(url)) > 0),
  platform public.platform not null,
  content_type public.content_type not null,
  external_id text,
  thumbnail_url text,
  published_at timestamptz,
  topic text,
  hook_text text,
  hook_type public.hook_type,
  cta_keyword text,
  notes text,
  status public.content_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_items_platform_type_check check (
    (platform = 'youtube' and content_type in ('youtube_video', 'youtube_short'))
    or (platform = 'instagram' and content_type = 'instagram_reel')
  )
);

create table public.stat_snapshots (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  snapshot_date date not null,
  views integer check (views is null or views >= 0),
  likes integer check (likes is null or likes >= 0),
  comments integer check (comments is null or comments >= 0),
  shares integer check (shares is null or shares >= 0),
  saves integer check (saves is null or saves >= 0),
  followers_or_subscribers_gained integer,
  average_view_duration_seconds numeric check (
    average_view_duration_seconds is null
    or average_view_duration_seconds >= 0
  ),
  watch_time_minutes numeric check (
    watch_time_minutes is null
    or watch_time_minutes >= 0
  ),
  notes text,
  created_at timestamptz not null default now(),
  unique (content_item_id, snapshot_date)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  slug text not null check (length(btrim(slug)) > 0),
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table public.content_tags (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (content_item_id, tag_id)
);

create table public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider public.platform_provider not null,
  provider_account_id text,
  account_name text,
  scopes text[],
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index content_items_user_url_idx
  on public.content_items (user_id, url);
create index content_items_user_id_idx
  on public.content_items (user_id);
create index content_items_user_platform_idx
  on public.content_items (user_id, platform);
create index content_items_user_content_type_idx
  on public.content_items (user_id, content_type);
create index content_items_user_published_at_idx
  on public.content_items (user_id, published_at desc);
create index content_items_user_status_idx
  on public.content_items (user_id, status);
create index content_items_user_topic_idx
  on public.content_items (user_id, topic);

create index stat_snapshots_content_item_id_idx
  on public.stat_snapshots (content_item_id);
create index stat_snapshots_content_date_idx
  on public.stat_snapshots (content_item_id, snapshot_date desc);

create index tags_user_id_idx
  on public.tags (user_id);
create index content_tags_tag_id_idx
  on public.content_tags (tag_id);

create index platform_accounts_user_provider_idx
  on public.platform_accounts (user_id, provider);
create unique index platform_accounts_user_provider_account_idx
  on public.platform_accounts (user_id, provider, provider_account_id)
  where provider_account_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger content_items_set_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();

create trigger platform_accounts_set_updated_at
  before update on public.platform_accounts
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.stat_snapshots enable row level security;
alter table public.tags enable row level security;
alter table public.content_tags enable row level security;
alter table public.platform_accounts enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can delete own profile"
  on public.profiles for delete
  using (id = auth.uid());

create policy "Users can read own content"
  on public.content_items for select
  using (user_id = auth.uid());

create policy "Users can insert own content"
  on public.content_items for insert
  with check (user_id = auth.uid());

create policy "Users can update own content"
  on public.content_items for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own content"
  on public.content_items for delete
  using (user_id = auth.uid());

create policy "Users can read snapshots for own content"
  on public.stat_snapshots for select
  using (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = auth.uid()
    )
  );

create policy "Users can insert snapshots for own content"
  on public.stat_snapshots for insert
  with check (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = auth.uid()
    )
  );

create policy "Users can update snapshots for own content"
  on public.stat_snapshots for update
  using (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = auth.uid()
    )
  );

create policy "Users can delete snapshots for own content"
  on public.stat_snapshots for delete
  using (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = auth.uid()
    )
  );

create policy "Users can read own tags"
  on public.tags for select
  using (user_id = auth.uid());

create policy "Users can insert own tags"
  on public.tags for insert
  with check (user_id = auth.uid());

create policy "Users can update own tags"
  on public.tags for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own tags"
  on public.tags for delete
  using (user_id = auth.uid());

create policy "Users can read own content tag joins"
  on public.content_tags for select
  using (
    exists (
      select 1
      from public.content_items
      join public.tags on tags.id = content_tags.tag_id
      where content_items.id = content_tags.content_item_id
        and content_items.user_id = auth.uid()
        and tags.user_id = auth.uid()
    )
  );

create policy "Users can insert own content tag joins"
  on public.content_tags for insert
  with check (
    exists (
      select 1
      from public.content_items
      join public.tags on tags.id = content_tags.tag_id
      where content_items.id = content_tags.content_item_id
        and content_items.user_id = auth.uid()
        and tags.user_id = auth.uid()
    )
  );

create policy "Users can delete own content tag joins"
  on public.content_tags for delete
  using (
    exists (
      select 1
      from public.content_items
      join public.tags on tags.id = content_tags.tag_id
      where content_items.id = content_tags.content_item_id
        and content_items.user_id = auth.uid()
        and tags.user_id = auth.uid()
    )
  );

create policy "Users can read own platform accounts"
  on public.platform_accounts for select
  using (user_id = auth.uid());

create policy "Users can insert own platform accounts"
  on public.platform_accounts for insert
  with check (user_id = auth.uid());

create policy "Users can update own platform accounts"
  on public.platform_accounts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own platform accounts"
  on public.platform_accounts for delete
  using (user_id = auth.uid());
