import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { SnapshotCreateInput } from "@/lib/validation/snapshots";

type Supabase = SupabaseClient<Database>;

export type StatSnapshot =
  Database["public"]["Tables"]["stat_snapshots"]["Row"];

export async function listStatSnapshots(
  supabase: Supabase,
  contentItemId: string,
) {
  const { data, error } = await supabase
    .from("stat_snapshots")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("snapshot_date", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createStatSnapshot(
  supabase: Supabase,
  contentItemId: string,
  input: SnapshotCreateInput,
) {
  const { data, error } = await supabase
    .from("stat_snapshots")
    .insert({
      ...input,
      content_item_id: contentItemId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
