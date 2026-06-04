create index content_items_source_account_id_idx
  on public.content_items (source_account_id);

create policy "Browser clients cannot read platform accounts"
  on public.platform_accounts for select
  using (false);

create policy "Browser clients cannot insert platform accounts"
  on public.platform_accounts for insert
  with check (false);

create policy "Browser clients cannot update platform accounts"
  on public.platform_accounts for update
  using (false)
  with check (false);

create policy "Browser clients cannot delete platform accounts"
  on public.platform_accounts for delete
  using (false);
