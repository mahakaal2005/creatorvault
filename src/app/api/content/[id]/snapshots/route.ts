import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api/auth";
import { apiError, validationError } from "@/lib/api/responses";
import { getContentItemById } from "@/lib/content/repository";
import {
  createStatSnapshot,
  listStatSnapshots,
} from "@/lib/content/snapshots";
import { createClient } from "@/lib/supabase/server";
import { snapshotCreateSchema } from "@/lib/validation/snapshots";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isDuplicateSnapshotError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function getValidatedId(context: RouteContext) {
  const params = await context.params;
  return paramsSchema.safeParse(params);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const params = await getValidatedId(context);

  if (!params.success) {
    return validationError(params.error);
  }

  const supabase = await createClient();
  const content = await getContentItemById(supabase, params.data.id);

  if (!content) {
    return apiError(404, "NOT_FOUND", "Content item was not found.");
  }

  const snapshots = await listStatSnapshots(supabase, params.data.id);

  return NextResponse.json({ snapshots });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const params = await getValidatedId(context);

  if (!params.success) {
    return validationError(params.error);
  }

  const body = await request.json().catch(() => null);
  const parsed = snapshotCreateSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createClient();
  const content = await getContentItemById(supabase, params.data.id);

  if (!content) {
    return apiError(404, "NOT_FOUND", "Content item was not found.");
  }

  try {
    const snapshot = await createStatSnapshot(
      supabase,
      params.data.id,
      parsed.data,
    );

    return NextResponse.json({ snapshot }, { status: 201 });
  } catch (error) {
    if (isDuplicateSnapshotError(error)) {
      return apiError(
        409,
        "DUPLICATE_SNAPSHOT_DATE",
        "A snapshot already exists for this date.",
      );
    }

    return apiError(
      500,
      "SNAPSHOT_CREATE_FAILED",
      "Could not save snapshot.",
    );
  }
}
