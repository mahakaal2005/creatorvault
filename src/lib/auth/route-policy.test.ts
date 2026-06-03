import { describe, expect, it } from "vitest";

import {
  AUTH_ROUTES,
  getAuthRedirect,
  isAuthRoute,
  isProtectedRoute,
} from "./route-policy";

describe("auth route policy", () => {
  it("treats app pages as protected and login as public", () => {
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/content")).toBe(true);
    expect(isProtectedRoute("/settings")).toBe(true);
    expect(isProtectedRoute("/login")).toBe(false);
    expect(isAuthRoute("/login")).toBe(true);
  });

  it("redirects signed-out users from protected pages to login", () => {
    const redirect = getAuthRedirect({
      pathname: "/content",
      search: "?platform=youtube",
      isAuthenticated: false,
    });

    expect(redirect).toBe("/login?next=%2Fcontent%3Fplatform%3Dyoutube");
  });

  it("redirects signed-in users away from auth pages", () => {
    expect(
      getAuthRedirect({
        pathname: AUTH_ROUTES.login,
        search: "",
        isAuthenticated: true,
      }),
    ).toBe("/dashboard");
  });
});
