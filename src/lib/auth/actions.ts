"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(formData: FormData) {
  const next = getString(formData, "next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

function validateCredentials(email: string, password: string) {
  if (!email || !password) {
    return "Email and password are required.";
  }

  return null;
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (host?.startsWith("localhost") ? "http" : "https");

  if (!host) {
    return "https://creatorvault-eight.vercel.app";
  }

  return `${protocol}://${host}`;
}

export async function signInWithPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const nextPath = getSafeNextPath(formData);
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
  } catch {
    return {
      error:
        "Supabase is not configured yet. Add your project URL and publishable key to .env.local.",
    };
  }

  redirect(nextPath);
}

export async function signUpWithPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const supabase = await createClient();
    const origin = await getRequestOrigin();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/login?verified=1`,
        data: {
          display_name: email.split("@")[0],
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
  } catch {
    return {
      error:
        "Supabase is not configured yet. Add your project URL and publishable key to .env.local.",
    };
  }

  redirect("/login?check_email=1");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // The user is effectively signed out if Supabase is unavailable locally.
  }

  redirect("/login");
}
