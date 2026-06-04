import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError, validationError } from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getYouTubeVideos,
  listUploadVideoIds,
  getOwnYouTubeChannel,
} from "@/lib/youtube/api";
import { getValidAccessToken, getYouTubeAccount } from "@/lib/youtube/account";
import { saveImportedVideos } from "@/lib/youtube/sync";
import { youtubeSyncSchema } from "@/lib/youtube/validation";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = youtubeSyncSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const admin = createAdminClient();
    const account = await getYouTubeAccount(admin, user.id);

    if (!account) {
      return apiError(
        400,
        "YOUTUBE_NOT_CONNECTED",
        "Connect YouTube before syncing.",
      );
    }

    const accessToken = await getValidAccessToken({ supabase: admin, account });
    const channel = await getOwnYouTubeChannel(accessToken);
    const videoIds = await listUploadVideoIds({
      accessToken,
      uploadsPlaylistId: channel.uploadsPlaylistId,
    });
    const limitedVideoIds = parsed.data.max_results
      ? videoIds.slice(0, parsed.data.max_results)
      : videoIds;
    const videos = await getYouTubeVideos({
      accessToken,
      videoIds: limitedVideoIds,
    });
    const syncedAt = new Date().toISOString();
    const summary = await saveImportedVideos({
      supabase: admin,
      userId: user.id,
      accountId: account.id,
      videos,
      filters: parsed.data,
      syncedAt,
      snapshotDate: today(),
    });

    return NextResponse.json({ summary });
  } catch {
    return apiError(
      500,
      "YOUTUBE_SYNC_FAILED",
      "Could not sync YouTube uploads.",
    );
  }
}
