import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api/auth";
import { apiError, validationError } from "@/lib/api/responses";
import {
  deleteContentItem,
  getContentItemById,
  updateContentItem,
} from "@/lib/content/repository";
import { createClient } from "@/lib/supabase/server";
import { contentUpdateSchema } from "@/lib/validation/content";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isDuplicateError(error: unknown) {
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

  return NextResponse.json({ content });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  const params = await getValidatedId(context);

  if (!params.success) {
    return validationError(params.error);
  }

  const body = await request.json().catch(() => null);
  const parsed = contentUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createClient();

  try {
    const content = await updateContentItem(
      supabase,
      user.id,
      params.data.id,
      parsed.data,
    );

    if (!content) {
      return apiError(404, "NOT_FOUND", "Content item was not found.");
    }

    return NextResponse.json({ content });
  } catch (error) {
    if (isDuplicateError(error)) {
      return apiError(
        409,
        "DUPLICATE_CONTENT",
        "This URL is already saved.",
      );
    }

    return apiError(500, "CONTENT_UPDATE_FAILED", "Could not update content.");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const params = await getValidatedId(context);

  if (!params.success) {
    return validationError(params.error);
  }

  const supabase = await createClient();
  const existing = await getContentItemById(supabase, params.data.id);

  if (!existing) {
    return apiError(404, "NOT_FOUND", "Content item was not found.");
  }

  await deleteContentItem(supabase, params.data.id);

  return NextResponse.json({ deleted: true });
}
