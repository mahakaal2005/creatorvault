"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <section className="rounded-lg border bg-card p-8 text-center">
      <h1 className="text-lg font-semibold tracking-normal">
        Something went wrong
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        The page could not load. Try again, or return to the library from the
        navigation.
      </p>
      <Button type="button" onClick={reset} className="mt-5">
        <RotateCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}
