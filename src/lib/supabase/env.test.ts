import { describe, expect, it } from "vitest";

import { getSupabaseBrowserEnv, getSupabaseServerEnv } from "./env";

describe("Supabase environment helpers", () => {
  it("returns browser-safe Supabase values when configured", () => {
    expect(
      getSupabaseBrowserEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it("accepts the legacy anon key as a fallback during setup", () => {
    expect(
      getSupabaseBrowserEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon-key",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "legacy-anon-key",
    });
  });

  it("throws a readable error when public env vars are missing", () => {
    expect(() => getSupabaseBrowserEnv({})).toThrow(
      "Missing Supabase environment variables",
    );
  });

  it("keeps the server secret optional for the MVP auth phase", () => {
    expect(
      getSupabaseServerEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
      secretKey: undefined,
    });
  });
});
