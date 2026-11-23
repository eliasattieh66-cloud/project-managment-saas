import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  replaceVerificationToken,
  findValidVerificationToken,
  markEmailVerified,
  replacePasswordResetToken,
  findValidPasswordResetToken,
  updatePasswordAndClearResetTokens,
} from "./auth.repository.js";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email.js";
import { generateVerificationToken, hashToken } from "../../utils/verificationToken.js";
import { verifyTurnstileToken } from "../../utils/turnstile.js";

const PASSWORD_SALT_ROUNDS = 10;
const PASSWORD_RESET_LIFETIME_MINUTES = 60;

async function sendNewVerificationEmail(user) {
  const { token, tokenHash, expiresAt } = generateVerificationToken();

  await replaceVerificationToken({ userId: user.id, tokenHash, expiresAt });

  const verificationUrl = `${env.clientUrl}/verify-email?token=${token}`;

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });
}

export async function registerUser({ name, email, password, turnstileToken, ip }) {
  const isHuman = await verifyTurnstileToken(turnstileToken, ip);

  if (!isHuman) {
    throw new AppError("Human verification failed. Please try again.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError("Email is already registered.", 409);
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  try {
    await sendNewVerificationEmail(user);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  return user;
}

export async function verifyEmail({ token }) {
  const tokenHash = hashToken(token);

  const verificationToken = await findValidVerificationToken(tokenHash);

  if (!verificationToken) {
    throw new AppError("This verification link is invalid or has expired.", 400);
  }

  await markEmailVerified(verificationToken.user_id);
}

export async function resendVerification({ email }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.email_verified_at) {
    return;
  }

  await sendNewVerificationEmail(user);
}

export async function requestPasswordReset({ email }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return;
  }

  const { token, tokenHash } = generateVerificationToken();
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_LIFETIME_MINUTES * 60 * 1000
  );

  await replacePasswordResetToken({ userId: user.id, tokenHash, expiresAt });

  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

export async function resetPassword({ token, password }) {
  const tokenHash = hashToken(token);

  const resetToken = await findValidPasswordResetToken(tokenHash);

  if (!resetToken) {
    throw new AppError("This reset link is invalid or has expired.", 400);
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await updatePasswordAndClearResetTokens({
    userId: resetToken.user_id,
    passwordHash,
  });
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.email_verified_at) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}