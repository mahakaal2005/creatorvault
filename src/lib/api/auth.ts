import { apiError } from "@/lib/api/responses";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function requireApiUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      response: apiError(401, "UNAUTHENTICATED", "Sign in is required."),
    };
  }

  return { user, response: null };
}
