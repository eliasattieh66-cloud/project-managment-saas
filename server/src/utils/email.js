import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.resendApiKey);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendVerificationEmail({ to, name, verificationUrl }) {
  const safeName = escapeHtml(name);

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: "Verify your TaskFlow email",
    text: `Hi ${name},\n\nWelcome to TaskFlow! Please verify your email by opening this link:\n\n${verificationUrl}\n\nThis link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Welcome to TaskFlow, ${safeName}!</h1>
        <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px;">
          Please confirm your email address to activate your account.
        </p>
        <a href="${verificationUrl}"
           style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold;">
          Verify my email
        </a>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 24px 0 0;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Could not send verification email: ${error.message}`);
  }
}
