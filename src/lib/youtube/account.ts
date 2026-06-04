import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import {
  decryptOAuthToken,
  encryptOAuthToken,
  refreshAccessToken,
  tokenExpiry,
  YOUTUBE_SCOPE,
} from "@/lib/youtube/oauth";

type Supabase = SupabaseClient<Database>;
export type PlatformAccount =
  Database["public"]["Tables"]["platform_accounts"]["Row"];

export async function getYouTubeAccount(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "youtube")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveYouTubeAccount({
  supabase,
  userId,
  providerAccountId,
  accountName,
  accessToken,
  refreshToken,
  expiresIn,
}: {
  supabase: Supabase;
  userId: string;
  providerAccountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) {
  const existing = await getYouTubeAccount(supabase, userId);
  const encryptedRefreshToken = refreshToken
    ? encryptOAuthToken(refreshToken)
    : existing?.refresh_token_encrypted ?? null;

  const payload = {
    user_id: userId,
    provider: "youtube" as const,
    provider_account_id: providerAccountId,
    account_name: accountName,
    scopes: [YOUTUBE_SCOPE],
    access_token_encrypted: encryptOAuthToken(accessToken),
    refresh_token_encrypted: encryptedRefreshToken,
    token_expires_at: tokenExpiry(expiresIn),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("platform_accounts")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("platform_accounts")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteYouTubeAccount(supabase: Supabase, userId: string) {
  const { error } = await supabase
    .from("platform_accounts")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "youtube");

  if (error) {
    throw error;
  }
}

export async function getValidAccessToken({
  supabase,
  account,
}: {
  supabase: Supabase;
  account: PlatformAccount;
}) {
  if (!account.access_token_encrypted) {
    throw new Error("YouTube account is missing an access token.");
  }

  const expiresAt = account.token_expires_at
    ? new Date(account.token_expires_at).getTime()
    : 0;
  const expiresSoon = expiresAt <= Date.now() + 60_000;

  if (!expiresSoon) {
    return decryptOAuthToken(account.access_token_encrypted);
  }

  if (!account.refresh_token_encrypted) {
    return decryptOAuthToken(account.access_token_encrypted);
  }

  const refreshed = await refreshAccessToken({
    refreshToken: decryptOAuthToken(account.refresh_token_encrypted),
  });

  const { error } = await supabase
    .from("platform_accounts")
    .update({
      access_token_encrypted: encryptOAuthToken(refreshed.access_token),
      token_expires_at: tokenExpiry(refreshed.expires_in),
    })
    .eq("id", account.id)
    .eq("user_id", account.user_id);

  if (error) {
    throw error;
  }

  return refreshed.access_token;
}
