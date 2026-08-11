import { registerUser } from "./auth.service.js";
import { validateRegisterInput } from "./auth.validation.js";

export async function register(req, res) {
  try {
    const validation = validateRegisterInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: validation.errors,
      });
    }

    const user = await registerUser(req.body);

    return res.status(201).json({
      message: "User registered successfully.",
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong.",
    });
  }
}