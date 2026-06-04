"use client";

import { FormEvent, useEffect, useState } from "react";
import { RefreshCw, Trash2, Unlink, Video } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

type StatusResponse = {
  configured: boolean;
  connected: boolean;
  account: {
    name: string | null;
    provider_account_id: string | null;
    updated_at: string;
  } | null;
};

type SyncSummary = {
  fetched: number;
  imported: number;
  created: number;
  updated: number;
  skipped_existing: number;
  snapshots: number;
};

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";
const labelClassName = "text-xs font-medium text-muted-foreground";

function formPayload(form: HTMLFormElement) {
  const data = new FormData(form);
  const payload: Record<string, string | number | boolean> = {};

  for (const [key, value] of data.entries()) {
    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    if (key === "max_results") {
      payload[key] = Number(value);
    } else {
      payload[key] = value;
    }
  }

  payload.include_existing = data.get("include_existing") === "on";

  return payload;
}

export function YouTubeSyncPanel() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [message, setMessage] = useState("");
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);
  const [pending, setPending] = useState(false);

  async function loadStatus() {
    const response = await fetch("/api/youtube/status");
    const body = (await response.json()) as StatusResponse;
    setStatus(body);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialStatus() {
      try {
        const response = await fetch("/api/youtube/status");
        const body = (await response.json()) as StatusResponse;

        if (!cancelled) {
          setStatus(body);
        }
      } catch {
        if (!cancelled) {
          setMessage("Could not load YouTube connection status.");
        }
      }
    }

    void loadInitialStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  async function sync(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setSyncSummary(null);

    const response = await fetch("/api/youtube/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload(event.currentTarget)),
    });
    const body = await response.json();
    setPending(false);

    if (!response.ok) {
      setMessage(body.error?.message ?? "Could not sync YouTube.");
      return;
    }

    setSyncSummary(body.summary);
    setMessage("YouTube sync finished.");
  }

  async function disconnect() {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/youtube/disconnect", {
      method: "POST",
    });

    setPending(false);

    if (!response.ok) {
      setMessage("Could not disconnect YouTube.");
      return;
    }

    setSyncSummary(null);
    await loadStatus();
    setMessage("YouTube disconnected.");
  }

  async function deleteImported(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const response = await fetch("/api/youtube/imported", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload(event.currentTarget)),
    });
    const body = await response.json();

    setPending(false);

    if (!response.ok) {
      setMessage(body.error?.message ?? "Could not delete imported content.");
      return;
    }

    setMessage(`Deleted ${body.deleted} imported YouTube item(s).`);
  }

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-normal">
            <Video className="size-4" aria-hidden="true" />
            YouTube sync
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {status && !status.configured
              ? "YouTube sync needs production secrets before it can be connected."
              : status?.connected
                ? `Connected to ${status.account?.name ?? "YouTube"}.`
                : "Connect a YouTube account to import uploaded videos and Shorts."}
          </p>
        </div>
        {status?.connected ? (
          <Button
            type="button"
            variant="outline"
            onClick={disconnect}
            disabled={pending}
          >
            <Unlink className="size-4" aria-hidden="true" />
            Disconnect
          </Button>
        ) : status?.configured === false ? (
          <Button type="button" disabled>
            <Video className="size-4" aria-hidden="true" />
            Setup needed
          </Button>
        ) : (
          <a href="/api/youtube/connect" className={buttonVariants()}>
            <Video className="size-4" aria-hidden="true" />
            Connect
          </a>
        )}
      </div>

      {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}

      {status?.connected ? (
        <div className="mt-5 grid gap-5">
          <form className="space-y-4" onSubmit={sync}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className={labelClassName}>Import type</span>
                <select className={inputClassName} name="content_type">
                  <option value="">Everything</option>
                  <option value="youtube_video">Videos only</option>
                  <option value="youtube_short">Shorts only</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className={labelClassName}>Max results</span>
                <input
                  className={inputClassName}
                  min="1"
                  name="max_results"
                  placeholder="All"
                  type="number"
                />
              </label>
              <label className="space-y-1.5">
                <span className={labelClassName}>Published from</span>
                <input className={inputClassName} name="published_from" type="date" />
              </label>
              <label className="space-y-1.5">
                <span className={labelClassName}>Published to</span>
                <input className={inputClassName} name="published_to" type="date" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input defaultChecked name="include_existing" type="checkbox" />
              Update already imported items
            </label>
            <Button type="submit" disabled={pending}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Sync now
            </Button>
          </form>

          {syncSummary ? (
            <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm sm:grid-cols-3">
              <span>Fetched: {syncSummary.fetched}</span>
              <span>Created: {syncSummary.created}</span>
              <span>Updated: {syncSummary.updated}</span>
              <span>Imported: {syncSummary.imported}</span>
              <span>Snapshots: {syncSummary.snapshots}</span>
              <span>Skipped: {syncSummary.skipped_existing}</span>
            </div>
          ) : null}

          <form className="space-y-4 border-t pt-5" onSubmit={deleteImported}>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className={labelClassName}>Delete type</span>
                <select className={inputClassName} name="content_type">
                  <option value="">All imported</option>
                  <option value="youtube_video">Videos only</option>
                  <option value="youtube_short">Shorts only</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className={labelClassName}>Published from</span>
                <input className={inputClassName} name="published_from" type="date" />
              </label>
              <label className="space-y-1.5">
                <span className={labelClassName}>Published to</span>
                <input className={inputClassName} name="published_to" type="date" />
              </label>
            </div>
            <Button type="submit" variant="destructive" disabled={pending}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete imported
            </Button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
