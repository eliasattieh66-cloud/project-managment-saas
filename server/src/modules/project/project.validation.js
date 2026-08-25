import { AppError } from "../../utils/AppError.js";

export function validateCreateProjectInput({ name, description }) {
  const errors = {};

  if (name === undefined || name === null) {
    errors.name = "Project name is required.";
  } else if (typeof name !== "string") {
    errors.name = "Project name must be a string.";
  } else if (name.trim().length === 0) {
    errors.name = "Project name cannot be empty.";
  } else if (name.trim().length > 150) {
    errors.name = "Project name must be less than or equal to 150 characters.";
  }

  let normalizedDescription = null;
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      errors.description = "Project description must be a string.";
    } else {
      normalizedDescription = description.trim().length > 0 ? description.trim() : null;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    name: name.trim(),
    description: normalizedDescription,
  };
}
