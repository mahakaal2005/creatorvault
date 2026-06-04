import crypto from "node:crypto";

const VERSION = "v1";
const IV_LENGTH = 12;
const ALGORITHM = "aes-256-gcm";

function keyFromSecret(secret: string) {
  if (!secret.trim()) {
    throw new Error("Missing token encryption secret.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

export function encryptToken(token: string, secret: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyFromSecret(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [VERSION, encode(iv), encode(tag), encode(encrypted)].join(":");
}

export function decryptToken(encryptedToken: string, secret: string) {
  try {
    const [version, iv, tag, encrypted] = encryptedToken.split(":");

    if (version !== VERSION || !iv || !tag || !encrypted) {
      throw new Error("Unsupported token format.");
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      keyFromSecret(secret),
      decode(iv),
    );
    decipher.setAuthTag(decode(tag));

    return Buffer.concat([
      decipher.update(decode(encrypted)),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Could not decrypt OAuth token.");
  }
}
