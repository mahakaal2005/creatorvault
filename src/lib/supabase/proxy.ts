import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getAuthRedirect } from "@/lib/auth/route-policy";

import type { Database } from "./database.types";
import { getSupabaseBrowserEnv } from "./env";

function createRedirectResponse(request: NextRequest, redirectPath: string) {
  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  let supabaseConfig: ReturnType<typeof getSupabaseBrowserEnv>;

  try {
    supabaseConfig = getSupabaseBrowserEnv();
  } catch {
    const redirectPath = getAuthRedirect({
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
      isAuthenticated: false,
    });

    return redirectPath
      ? createRedirectResponse(request, redirectPath)
      : supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims && !error);
  const redirectPath = getAuthRedirect({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    isAuthenticated,
  });

  return redirectPath
    ? createRedirectResponse(request, redirectPath)
    : supabaseResponse;
}
