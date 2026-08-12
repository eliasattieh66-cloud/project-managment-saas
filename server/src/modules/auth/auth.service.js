import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "./auth.repository.js";

const PASSWORD_SALT_ROUNDS = 10;

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return user;
}