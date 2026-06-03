type SupabaseEnvInput = Record<string, string | undefined>;

export type SupabaseBrowserEnv = {
  url: string;
  publishableKey: string;
};

export type SupabaseServerEnv = SupabaseBrowserEnv & {
  secretKey?: string;
};

function getPublishableKey(env: SupabaseEnvInput) {
  return (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseBrowserEnv(
  env: SupabaseEnvInput = process.env,
): SupabaseBrowserEnv {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = getPublishableKey(env);

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseServerEnv(
  env: SupabaseEnvInput = process.env,
): SupabaseServerEnv {
  return {
    ...getSupabaseBrowserEnv(env),
    secretKey: env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
