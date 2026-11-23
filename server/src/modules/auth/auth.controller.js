import {
  loginUser,
  registerUser,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
} from "./auth.service.js";
import {
  validateLoginInput,
  validateRegisterInput,
  validateVerifyEmailInput,
  validateResendVerificationInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "./auth.validation.js";
import { AppError } from "../../utils/AppError.js";
import { generateAuthToken } from "../../utils/token.js";

export async function register(req, res) {
  const validation = validateRegisterInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  const user = await registerUser({ ...req.body, ip: req.ip });

  return res.status(201).json({
    message: "Account created. Please check your email to verify your account.",
    user,
  });
}

export async function verifyEmailController(req, res) {
  const validation = validateVerifyEmailInput(req.query);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  await verifyEmail({ token: req.query.token });

  return res.status(200).json({
    message: "Email verified successfully. You can now log in.",
  });
}

export async function resendVerificationController(req, res) {
  const validation = validateResendVerificationInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  await resendVerification({ email: req.body.email });

  return res.status(200).json({
    message:
      "If this email has an account that needs verifying, a new verification email has been sent.",
  });
}

export async function forgotPasswordController(req, res) {
  const validation = validateForgotPasswordInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  await requestPasswordReset({ email: req.body.email });

  return res.status(200).json({
    message:
      "If an account exists for this email, we've sent a link to reset your password.",
  });
}

export async function resetPasswordController(req, res) {
  const validation = validateResetPasswordInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  await resetPassword({
    token: req.body.token,
    password: req.body.password,
  });

  return res.status(200).json({
    message: "Your password has been changed. You can now log in.",
  });
}

export async function login(req, res) {
  const validation = validateLoginInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  const user = await loginUser(req.body);
  const token = generateAuthToken(user);

  return res.status(200).json({
    message: "Login successful.",
    user,
    token,
  });
}

export async function getCurrentUser(req, res) {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
}