"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn, UserPlus } from "lucide-react";

import {
  type AuthFormState,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/auth/actions";

const initialState: AuthFormState = {};

function SubmitButton({
  action,
  label,
}: {
  action: "signin" | "signup";
  label: string;
}) {
  const { pending } = useFormStatus();
  const Icon = action === "signin" ? LogIn : UserPlus;

  return (
    <button
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <Icon className="size-4" aria-hidden="true" />
      {pending ? "Working..." : label}
    </button>
  );
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [signInState, signInAction] = useActionState(
    signInWithPassword,
    initialState,
  );
  const [signUpState, signUpAction] = useActionState(
    signUpWithPassword,
    initialState,
  );

  return (
    <div className="mt-6 space-y-5">
      <form action={signInAction} className="space-y-4">
        <input name="next" type="hidden" value={nextPath} />
        <AuthFields idPrefix="signin" />
        {signInState.error ? <AuthError message={signInState.error} /> : null}
        <SubmitButton action="signin" label="Sign in" />
      </form>

      <div className="border-t pt-5">
        <form action={signUpAction} className="space-y-4">
          <AuthFields idPrefix="signup" />
          {signUpState.error ? <AuthError message={signUpState.error} /> : null}
          <SubmitButton action="signup" label="Create private account" />
        </form>
      </div>
    </div>
  );
}

function AuthFields({ idPrefix }: { idPrefix: string }) {
  const emailId = `${idPrefix}-email`;
  const passwordId = `${idPrefix}-password`;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor={passwordId}>
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="At least 6 characters"
        />
      </div>
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
