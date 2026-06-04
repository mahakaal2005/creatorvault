import { describe, expect, it } from "vitest";

import {
  hasRequiredYouTubeScopes,
  YOUTUBE_ANALYTICS_SCOPE,
  YOUTUBE_DATA_SCOPE,
  YOUTUBE_SCOPES,
} from "./oauth";

describe("YouTube OAuth scopes", () => {
  it("requests both Data API and Analytics API read scopes", () => {
    expect(YOUTUBE_SCOPES).toEqual([
      YOUTUBE_DATA_SCOPE,
      YOUTUBE_ANALYTICS_SCOPE,
    ]);
  });

  it("detects existing connections that need a reconnect for analytics", () => {
    expect(hasRequiredYouTubeScopes([YOUTUBE_DATA_SCOPE])).toBe(false);
    expect(
      hasRequiredYouTubeScopes([YOUTUBE_DATA_SCOPE, YOUTUBE_ANALYTICS_SCOPE]),
    ).toBe(true);
  });
});
