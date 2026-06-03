export default function AppLoading() {
  return (
    <div className="space-y-6 pb-16 sm:pb-0" aria-label="Loading page">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-muted" />
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-5">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-48 animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </section>
    </div>
  );
}
