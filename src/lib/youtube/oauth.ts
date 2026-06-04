import { decryptToken, encryptToken } from "./crypto";

const YOUTUBE_DATA_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
const YOUTUBE_ANALYTICS_SCOPE =
  "https://www.googleapis.com/auth/yt-analytics.readonly";
const YOUTUBE_SCOPES = [YOUTUBE_DATA_SCOPE, YOUTUBE_ANALYTICS_SCOPE] as const;
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GoogleTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

export type YouTubeOAuthEnv = {
  clientId: string;
  clientSecret: string;
  tokenSecret: string;
};

export function getYouTubeOAuthEnv(env: NodeJS.ProcessEnv = process.env) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const tokenSecret = env.YOUTUBE_SYNC_TOKEN_SECRET;

  if (!clientId || !clientSecret || !tokenSecret) {
    throw new Error(
      "Missing YouTube sync environment variables. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and YOUTUBE_SYNC_TOKEN_SECRET.",
    );
  }

  return { clientId, clientSecret, tokenSecret };
}

export function youtubeRedirectUri(origin: string) {
  return `${origin}/api/youtube/callback`;
}

export function buildAuthorizationUrl({
  origin,
  state,
  env = getYouTubeOAuthEnv(),
}: {
  origin: string;
  state: string;
  env?: YouTubeOAuthEnv;
}) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", youtubeRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", YOUTUBE_SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  return url;
}

async function tokenRequest(body: URLSearchParams): Promise<GoogleTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Google token request failed.");
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

export async function exchangeCodeForTokens({
  code,
  origin,
  env = getYouTubeOAuthEnv(),
}: {
  code: string;
  origin: string;
  env?: YouTubeOAuthEnv;
}) {
  return tokenRequest(
    new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: youtubeRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  );
}

export async function refreshAccessToken({
  refreshToken,
  env = getYouTubeOAuthEnv(),
}: {
  refreshToken: string;
  env?: YouTubeOAuthEnv;
}) {
  return tokenRequest(
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: "refresh_token",
    }),
  );
}

export function encryptOAuthToken(token: string, env = getYouTubeOAuthEnv()) {
  return encryptToken(token, env.tokenSecret);
}

export function decryptOAuthToken(
  encryptedToken: string,
  env = getYouTubeOAuthEnv(),
) {
  return decryptToken(encryptedToken, env.tokenSecret);
}

export function tokenExpiry(expiresInSeconds: number | undefined, now = new Date()) {
  if (!expiresInSeconds) {
    return null;
  }

  return new Date(now.getTime() + expiresInSeconds * 1000).toISOString();
}

export function parseScopeString(scope: string | undefined) {
  return scope?.split(/\s+/).filter(Boolean) ?? [...YOUTUBE_SCOPES];
}

export function hasRequiredYouTubeScopes(scopes: string[] | null | undefined) {
  const scopeSet = new Set(scopes ?? []);

  return YOUTUBE_SCOPES.every((scope) => scopeSet.has(scope));
}

export {
  YOUTUBE_ANALYTICS_SCOPE,
  YOUTUBE_DATA_SCOPE,
  YOUTUBE_DATA_SCOPE as YOUTUBE_SCOPE,
  YOUTUBE_SCOPES,
};
