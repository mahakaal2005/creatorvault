"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

type StatsSnapshotFormProps = {
  contentId: string;
};

const metricFields = [
  { name: "views", label: "Views", step: "1" },
  { name: "likes", label: "Likes", step: "1" },
  { name: "comments", label: "Comments", step: "1" },
  { name: "shares", label: "Shares", step: "1" },
  { name: "saves", label: "Saves", step: "1" },
  {
    name: "followers_or_subscribers_gained",
    label: "Audience gained",
    step: "1",
  },
  {
    name: "average_view_duration_seconds",
    label: "Avg view seconds",
    step: "0.1",
  },
  { name: "watch_time_minutes", label: "Watch minutes", step: "0.1" },
] as const;

function todayString() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 10);
}

function numberOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return Number(value);
}

export function StatsSnapshotForm({ contentId }: StatsSnapshotFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      snapshot_date: formData.get("snapshot_date"),
      notes: formData.get("notes"),
      ...Object.fromEntries(
        metricFields.map((field) => [
          field.name,
          numberOrNull(formData.get(field.name)),
        ]),
      ),
    };

    const response = await fetch(`/api/content/${contentId}/snapshots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body.error?.message ?? "Could not save snapshot.");
      return;
    }

    formRef.current?.reset();
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={submit} className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-normal">
          Add stats snapshot
        </h2>
        <p className="text-sm text-muted-foreground">
          Suggested rhythm: Day 0, 1, 3, 7, 14, and 30.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <Field label="Snapshot date" htmlFor="snapshot_date">
          <input
            id="snapshot_date"
            name="snapshot_date"
            type="date"
            required
            defaultValue={todayString()}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          {metricFields.map((field) => (
            <Field key={field.name} label={field.label} htmlFor={field.name}>
              <input
                id={field.name}
                name={field.name}
                type="number"
                min="0"
                step={field.step}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </Field>
          ))}
        </div>

        <Field label="Snapshot notes" htmlFor="snapshot_notes">
          <textarea
            id="snapshot_notes"
            name="notes"
            className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-5">
        <Save className="size-4" aria-hidden="true" />
        {isSubmitting ? "Saving..." : "Save snapshot"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
