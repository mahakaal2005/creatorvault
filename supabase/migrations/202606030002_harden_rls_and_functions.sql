create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can delete own profile"
  on public.profiles for delete
  using (id = (select auth.uid()));

drop policy if exists "Users can read own content" on public.content_items;
drop policy if exists "Users can insert own content" on public.content_items;
drop policy if exists "Users can update own content" on public.content_items;
drop policy if exists "Users can delete own content" on public.content_items;

create policy "Users can read own content"
  on public.content_items for select
  using (user_id = (select auth.uid()));

create policy "Users can insert own content"
  on public.content_items for insert
  with check (user_id = (select auth.uid()));

create policy "Users can update own content"
  on public.content_items for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete own content"
  on public.content_items for delete
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read snapshots for own content" on public.stat_snapshots;
drop policy if exists "Users can insert snapshots for own content" on public.stat_snapshots;
drop policy if exists "Users can update snapshots for own content" on public.stat_snapshots;
drop policy if exists "Users can delete snapshots for own content" on public.stat_snapshots;

create policy "Users can read snapshots for own content"
  on public.stat_snapshots for select
  using (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = (select auth.uid())
    )
  );

create policy "Users can insert snapshots for own content"
  on public.stat_snapshots for insert
  with check (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = (select auth.uid())
    )
  );

create policy "Users can update snapshots for own content"
  on public.stat_snapshots for update
  using (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = (select auth.uid())
    )
  );

create policy "Users can delete snapshots for own content"
  on public.stat_snapshots for delete
  using (
    exists (
      select 1 from public.content_items
      where content_items.id = stat_snapshots.content_item_id
        and content_items.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can read own tags" on public.tags;
drop policy if exists "Users can insert own tags" on public.tags;
drop policy if exists "Users can update own tags" on public.tags;
drop policy if exists "Users can delete own tags" on public.tags;

create policy "Users can read own tags"
  on public.tags for select
  using (user_id = (select auth.uid()));

create policy "Users can insert own tags"
  on public.tags for insert
  with check (user_id = (select auth.uid()));

create policy "Users can update own tags"
  on public.tags for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete own tags"
  on public.tags for delete
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read own content tag joins" on public.content_tags;
drop policy if exists "Users can insert own content tag joins" on public.content_tags;
drop policy if exists "Users can delete own content tag joins" on public.content_tags;

create policy "Users can read own content tag joins"
  on public.content_tags for select
  using (
    exists (
      select 1
      from public.content_items
      join public.tags on tags.id = content_tags.tag_id
      where content_items.id = content_tags.content_item_id
        and content_items.user_id = (select auth.uid())
        and tags.user_id = (select auth.uid())
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
        and content_items.user_id = (select auth.uid())
        and tags.user_id = (select auth.uid())
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
        and content_items.user_id = (select auth.uid())
        and tags.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can read own platform accounts" on public.platform_accounts;
drop policy if exists "Users can insert own platform accounts" on public.platform_accounts;
drop policy if exists "Users can update own platform accounts" on public.platform_accounts;
drop policy if exists "Users can delete own platform accounts" on public.platform_accounts;

create policy "Users can read own platform accounts"
  on public.platform_accounts for select
  using (user_id = (select auth.uid()));

create policy "Users can insert own platform accounts"
  on public.platform_accounts for insert
  with check (user_id = (select auth.uid()));

create policy "Users can update own platform accounts"
  on public.platform_accounts for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete own platform accounts"
  on public.platform_accounts for delete
  using (user_id = (select auth.uid()));
