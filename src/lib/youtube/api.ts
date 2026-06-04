import type { Database } from "@/lib/supabase/database.types";

export type YouTubeVideoResource = {
  id: string;
  snippet: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

type YouTubeChannelResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YouTubePlaylistItemsResponse = {
  nextPageToken?: string;
  items?: Array<{
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
    snippet?: {
      title?: string;
      resourceId?: {
        videoId?: string;
      };
    };
  }>;
};

type YouTubeVideosResponse = {
  items?: YouTubeVideoResource[];
};

export type YouTubeChannel = {
  id: string;
  title: string;
  uploadsPlaylistId: string;
};

export type ImportedYouTubeVideo = {
  externalId: string;
  title: string;
  url: string;
  contentType: Database["public"]["Enums"]["content_type"];
  thumbnailUrl: string | null;
  publishedAt: string | null;
  description: string | null;
  durationSeconds: number;
  views: number | null;
  likes: number | null;
  comments: number | null;
};

function numericStat(value: string | undefined) {
  if (value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function bestThumbnail(thumbnails: YouTubeVideoResource["snippet"]["thumbnails"]) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    null
  );
}

export function parseIsoDurationSeconds(duration: string | undefined) {
  if (!duration) {
    return 0;
  }

  const match = duration.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/,
  );

  if (!match) {
    return 0;
  }

  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match;

  return (
    Number(days) * 86400 +
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds)
  );
}

export function toImportedVideo(
  video: YouTubeVideoResource,
): ImportedYouTubeVideo {
  const durationSeconds = parseIsoDurationSeconds(video.contentDetails.duration);
  const contentType = durationSeconds <= 60 ? "youtube_short" : "youtube_video";

  return {
    externalId: video.id,
    title: video.snippet.title?.trim() || "Untitled YouTube video",
    url:
      contentType === "youtube_short"
        ? `https://www.youtube.com/shorts/${video.id}`
        : `https://www.youtube.com/watch?v=${video.id}`,
    contentType,
    thumbnailUrl: bestThumbnail(video.snippet.thumbnails),
    publishedAt: video.snippet.publishedAt ?? null,
    description: video.snippet.description?.trim() || null,
    durationSeconds,
    views: numericStat(video.statistics?.viewCount),
    likes: numericStat(video.statistics?.likeCount),
    comments: numericStat(video.statistics?.commentCount),
  };
}

async function youtubeGet<T>(
  path: string,
  accessToken: string,
  params: Record<string, string>,
) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`YouTube API request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getOwnYouTubeChannel(accessToken: string) {
  const data = await youtubeGet<YouTubeChannelResponse>("channels", accessToken, {
    part: "snippet,contentDetails",
    mine: "true",
  });
  const channel = data.items?.[0];
  const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;

  if (!channel?.id || !uploadsPlaylistId) {
    throw new Error("Could not find a YouTube channel for this account.");
  }

  return {
    id: channel.id,
    title: channel.snippet?.title ?? "YouTube channel",
    uploadsPlaylistId,
  };
}

export async function listUploadVideoIds({
  accessToken,
  uploadsPlaylistId,
}: {
  accessToken: string;
  uploadsPlaylistId: string;
}) {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const data = await youtubeGet<YouTubePlaylistItemsResponse>(
      "playlistItems",
      accessToken,
      {
        part: "contentDetails",
        playlistId: uploadsPlaylistId,
        maxResults: "50",
        ...(pageToken ? { pageToken } : {}),
      },
    );

    data.items?.forEach((item) => {
      const videoId = item.contentDetails?.videoId;

      if (videoId) {
        videoIds.push(videoId);
      }
    });

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videoIds;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export async function getYouTubeVideos({
  accessToken,
  videoIds,
}: {
  accessToken: string;
  videoIds: string[];
}) {
  const videos: ImportedYouTubeVideo[] = [];

  for (const videoIdBatch of chunk(videoIds, 50)) {
    const data = await youtubeGet<YouTubeVideosResponse>("videos", accessToken, {
      part: "snippet,contentDetails,statistics",
      id: videoIdBatch.join(","),
    });

    videos.push(...(data.items ?? []).map(toImportedVideo));
  }

  return videos;
}
