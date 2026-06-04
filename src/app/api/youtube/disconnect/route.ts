import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/server";
import { deleteYouTubeAccount } from "@/lib/youtube/account";

export async function POST() {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  try {
    await deleteYouTubeAccount(createAdminClient(), user.id);

    return NextResponse.json({ disconnected: true });
  } catch {
    return apiError(
      500,
      "YOUTUBE_DISCONNECT_FAILED",
      "Could not disconnect YouTube.",
    );
  }
}
