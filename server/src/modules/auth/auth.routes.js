import express from "express";
import {
  login,
  register,
  getCurrentUser,
  verifyEmailController,
  resendVerificationController,
} from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  loginLimiter,
  registerLimiter,
  resendVerificationLimiter,
} from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/register",registerLimiter, asyncHandler(register));
router.post("/login", loginLimiter, asyncHandler(login));
router.get("/me", authenticate, getCurrentUser);
router.get("/verify-email", asyncHandler(verifyEmailController));
router.post("/resend-verification",resendVerificationLimiter, asyncHandler(resendVerificationController));

export default router;
