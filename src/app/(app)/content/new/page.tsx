import { ContentForm } from "@/components/content/content-form";

export default function AddContentPage() {
  return (
    <div className="max-w-3xl space-y-6 pb-16 sm:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Add Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a YouTube video, YouTube Short, or Instagram Reel URL, then save
          the metadata you want to track.
        </p>
      </div>

      <ContentForm mode="create" />
    </div>
  );
}
