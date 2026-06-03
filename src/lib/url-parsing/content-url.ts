import type { Database } from "@/lib/supabase/database.types";

type Platform = Database["public"]["Enums"]["platform"];
type ContentType = Database["public"]["Enums"]["content_type"];

export type ParsedContentUrl = {
  url: string;
  platform: Platform | null;
  content_type: ContentType | null;
  external_id: string | null;
  thumbnail_url: string | null;
  confidence: "high" | "low" | "unsupported";
};

function youtubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function cleanPathSegment(segment: string | undefined) {
  return segment ? decodeURIComponent(segment).trim() : null;
}

export function parseContentUrl(input: string): ParsedContentUrl {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return {
      url: input,
      platform: null,
      content_type: null,
      external_id: null,
      thumbnail_url: null,
      confidence: "unsupported",
    };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const normalizedUrl = url.toString();

  if (hostname === "youtube.com" || hostname === "m.youtube.com") {
    const [, firstSegment, secondSegment] = url.pathname.split("/");

    if (firstSegment === "shorts") {
      const externalId = cleanPathSegment(secondSegment);

      if (externalId) {
        return {
          url: normalizedUrl,
          platform: "youtube",
          content_type: "youtube_short",
          external_id: externalId,
          thumbnail_url: youtubeThumbnail(externalId),
          confidence: "high",
        };
      }
    }

    const watchId = url.searchParams.get("v");

    if (watchId) {
      return {
        url: normalizedUrl,
        platform: "youtube",
        content_type: "youtube_video",
        external_id: watchId,
        thumbnail_url: youtubeThumbnail(watchId),
        confidence: "high",
      };
    }
  }

  if (hostname === "youtu.be") {
    const [, videoId] = url.pathname.split("/");
    const externalId = cleanPathSegment(videoId);

    if (externalId) {
      return {
        url: normalizedUrl,
        platform: "youtube",
        content_type: "youtube_video",
        external_id: externalId,
        thumbnail_url: youtubeThumbnail(externalId),
        confidence: "high",
      };
    }
  }

  if (hostname === "instagram.com") {
    const [, firstSegment, secondSegment] = url.pathname.split("/");

    if (firstSegment === "reel") {
      const externalId = cleanPathSegment(secondSegment);

      if (externalId) {
        return {
          url: normalizedUrl,
          platform: "instagram",
          content_type: "instagram_reel",
          external_id: externalId,
          thumbnail_url: null,
          confidence: "high",
        };
      }
    }
  }

  return {
    url: normalizedUrl,
    platform: null,
    content_type: null,
    external_id: null,
    thumbnail_url: null,
    confidence: "unsupported",
  };
}
