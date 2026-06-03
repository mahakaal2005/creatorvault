import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function apiError(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
    },
    { status },
  );
}

export function validationError(error: ZodError) {
  return apiError(
    400,
    "VALIDATION_ERROR",
    "One or more fields are invalid.",
    error.flatten().fieldErrors,
  );
}
