import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAuthToken(user) {
  return jwt.sign(
    {
      userId: user.id,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}