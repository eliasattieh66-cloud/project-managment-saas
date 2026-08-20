import { AppError } from "../../utils/AppError.js";

export function validateCreateWorkspaceInput({ name }) {
  const errors = {};

  if (name === undefined || name === null) {
    errors.name = "Workspace name is required.";
  } else if (typeof name !== "string") {
    errors.name = "Workspace name must be a string.";
  } else if (name.trim().length === 0) {
    errors.name = "Workspace name cannot be empty.";
  } else if (name.trim().length > 100) {
    errors.name = "Workspace name must be less than or equal to 100 characters.";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    name: name.trim(),
  };
}