import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "./auth.repository.js";
import { AppError } from "../../utils/AppError.js";

const PASSWORD_SALT_ROUNDS = 10;

export async function registerUser({ name, email, password }) {
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

  return user;
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

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}