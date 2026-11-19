import { apiRequest } from "./client.js";

export async function verifyEmail(token) {
  const data = await apiRequest(
    `/auth/verify-email?token=${encodeURIComponent(token)}`
  );
  return data.message;
}

export async function resendVerification(email) {
  const data = await apiRequest("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return data.message;
}
