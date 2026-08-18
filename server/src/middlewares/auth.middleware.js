import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { findUserById } from "../modules/auth/auth.repository.js";

export async function authenticate(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required.", 401);
    }

    const token = authorizationHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwtSecret);

    const currentUser = await findUserById(decoded.userId);

    if (!currentUser) {
      throw new AppError("Invalid authentication token.", 401);
    }

    req.user = currentUser;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired authentication token.", 401));
    }

    next(error);
  }
}