import { Lock } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getAuthenticatedUser } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getAuthenticatedUser();
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Lock className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-normal">
              CreatorVault
            </h1>
            <p className="text-sm text-muted-foreground">
              Private creator login
            </p>
          </div>
        </div>

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
