import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { parseContentUrl } from "@/lib/url-parsing/content-url";

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return apiError(400, "VALIDATION_ERROR", "URL is required.", {
      url: ["URL is required."],
    });
  }

  const parsed = parseContentUrl(url);

  if (parsed.confidence === "unsupported") {
    return apiError(422, "UNSUPPORTED_URL", "Unsupported content URL.");
  }

  return NextResponse.json({ parsed });
}
