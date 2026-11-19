import crypto from "crypto";

const TOKEN_LIFETIME_HOURS = 24;

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_HOURS * 60 * 60 * 1000);

  return { token, tokenHash, expiresAt };
}
