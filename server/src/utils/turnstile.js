import { env } from "../config/env.js";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token, ip) {
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: env.turnstileSecretKey,
        response: token,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json();

    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error.message);
    return false;
  }
}
