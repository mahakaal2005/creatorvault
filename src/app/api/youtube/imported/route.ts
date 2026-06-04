import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError, validationError } from "@/lib/api/responses";
import { deleteImportedYouTubeContent } from "@/lib/content/repository";
import { createAdminClient } from "@/lib/supabase/server";
import { youtubeImportedDeleteSchema } from "@/lib/youtube/validation";

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = youtubeImportedDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const deleted = await deleteImportedYouTubeContent(
      createAdminClient(),
      user.id,
      parsed.data,
    );

    return NextResponse.json({ deleted });
  } catch {
    return apiError(
      500,
      "YOUTUBE_IMPORTED_DELETE_FAILED",
      "Could not delete imported YouTube content.",
    );
  }
}
