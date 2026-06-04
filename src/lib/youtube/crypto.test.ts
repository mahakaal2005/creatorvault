import { describe, expect, it } from "vitest";

import { decryptToken, encryptToken } from "./crypto";

describe("YouTube token encryption", () => {
  it("round-trips a token without storing it as plaintext", () => {
    const encrypted = encryptToken("ya29.token", "secret-one");

    expect(encrypted).not.toContain("ya29.token");
    expect(decryptToken(encrypted, "secret-one")).toBe("ya29.token");
  });

  it("rejects decryption with the wrong secret", () => {
    const encrypted = encryptToken("refresh-token", "secret-one");

    expect(() => decryptToken(encrypted, "secret-two")).toThrow(
      "Could not decrypt OAuth token.",
    );
  });
});
