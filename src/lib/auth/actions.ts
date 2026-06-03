"use server";

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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

  redirect("/dashboard");
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
