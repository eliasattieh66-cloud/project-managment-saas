import { loginUser, registerUser } from "./auth.service.js";
import { validateLoginInput, validateRegisterInput } from "./auth.validation.js";
import { AppError } from "../../utils/AppError.js";

export async function register(req, res) {
  const validation = validateRegisterInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  const user = await registerUser(req.body);

  return res.status(201).json({
    message: "User registered successfully.",
    user,
  });
}

export async function login(req, res) {
  const validation = validateLoginInput(req.body);

  if (!validation.isValid) {
    throw new AppError("Validation failed.", 400, validation.errors);
  }

  const user = await loginUser(req.body);

  return res.status(200).json({
    message: "Login successful.",
    user,
  });
}