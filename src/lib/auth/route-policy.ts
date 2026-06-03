export const AUTH_ROUTES = {
  login: "/login",
} as const;

const PROTECTED_PREFIXES = ["/dashboard", "/content", "/settings"];

type AuthRedirectInput = {
  pathname: string;
  search: string;
  isAuthenticated: boolean;
};

export function isAuthRoute(pathname: string) {
  return pathname === AUTH_ROUTES.login;
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getAuthRedirect({
  pathname,
  search,
  isAuthenticated,
}: AuthRedirectInput) {
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const next = encodeURIComponent(`${pathname}${search}`);

    return `${AUTH_ROUTES.login}?next=${next}`;
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    return "/dashboard";
  }

  return null;
}
