"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ContentActions({ contentId }: { contentId: string }) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archiveContent() {
    setIsWorking(true);
    setError(null);

    const response = await fetch(`/api/content/${contentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });

    setIsWorking(false);

    if (!response.ok) {
      setError("Could not archive this content item.");
      return;
    }

    router.refresh();
  }

  async function deleteContent() {
    const confirmed = window.confirm(
      "Delete this content item and its history permanently?",
    );

    if (!confirmed) {
      return;
    }

    setIsWorking(true);
    setError(null);

    const response = await fetch(`/api/content/${contentId}`, {
      method: "DELETE",
    });

    setIsWorking(false);

    if (!response.ok) {
      setError("Could not delete this content item.");
      return;
    }

    router.push("/content");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={archiveContent}
          disabled={isWorking}
        >
          <Archive className="size-4" aria-hidden="true" />
          Archive
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={deleteContent}
          disabled={isWorking}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
