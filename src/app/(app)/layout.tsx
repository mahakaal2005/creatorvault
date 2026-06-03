import Link from "next/link";
import { BarChart3, Library, Plus, Settings } from "lucide-react";
import { redirect } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { ensureProfileForUser, getAuthenticatedUser } from "@/lib/auth/session";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/content", label: "Library", icon: Library },
  { href: "/content/new", label: "Add", icon: Plus },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfileForUser(user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex flex-col">
            <span className="text-base font-semibold tracking-normal">
              CreatorVault
            </span>
            <span className="text-xs text-muted-foreground">
              Private creator archive
            </span>
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 sm:flex"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <form action={signOut}>
              <button
                className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6"
      >
        {children}
      </main>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 border-t bg-card sm:hidden"
      >
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
