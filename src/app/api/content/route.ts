import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError, validationError } from "@/lib/api/responses";
import {
  countContentItems,
  createContentItem,
  listContentItems,
} from "@/lib/content/repository";
import { createClient } from "@/lib/supabase/server";
import { contentCreateSchema } from "@/lib/validation/content";
import { contentFilterSchema } from "@/lib/validation/filters";

function isDuplicateError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const parsed = contentFilterSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createClient();
  const [items, total] = await Promise.all([
    listContentItems(supabase, parsed.data),
    countContentItems(supabase, parsed.data),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page: parsed.data.page,
      page_size: parsed.data.page_size,
      total,
    },
  });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  const body = await request.json().catch(() => null);
  const parsed = contentCreateSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createClient();

  try {
    const content = await createContentItem(supabase, user.id, parsed.data);

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    if (isDuplicateError(error)) {
      return apiError(
        409,
        "DUPLICATE_CONTENT",
        "This URL is already saved.",
      );
    }

    return apiError(500, "CONTENT_CREATE_FAILED", "Could not save content.");
  }
}
