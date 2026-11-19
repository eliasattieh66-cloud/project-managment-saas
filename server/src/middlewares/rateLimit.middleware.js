import rateLimit from "express-rate-limit";

function createLimiter({ windowMinutes, limit, message }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      status: "error",
      message,
    },
  });
}

export const loginLimiter = createLimiter({
  windowMinutes: 15,
  limit: 10,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

export const registerLimiter = createLimiter({
  windowMinutes: 60,
  limit: 5,
  message: "Too many accounts created. Please try again in an hour.",
});

export const resendVerificationLimiter = createLimiter({
  windowMinutes: 15,
  limit: 3,
  message:
    "Too many verification emails requested. Please try again in 15 minutes.",
});
