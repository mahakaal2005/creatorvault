import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function ensureProfileForUser(user: User) {
  const supabase = await createClient();
  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : null;

  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
  });
}
