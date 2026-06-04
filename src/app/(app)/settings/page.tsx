import { Button } from "@/components/ui/button";
import { YouTubeSyncPanel } from "@/components/youtube/youtube-sync-panel";
import { signOut } from "@/lib/auth/actions";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="max-w-3xl space-y-6 pb-16 sm:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile and account settings will be connected during the auth phase.
        </p>
      </div>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-base font-semibold tracking-normal">Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {user?.email ?? "your private CreatorVault account"}.
        </p>
        <form action={signOut}>
          <Button className="mt-4" type="submit">
            Sign out
          </Button>
        </form>
      </section>

      <YouTubeSyncPanel />
    </div>
  );
}
