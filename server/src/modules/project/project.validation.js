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

export function validateUpdateProjectInput({ name, description }) {
  const errors = {};
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string") {
      errors.name = "Project name must be a string.";
    } else if (name.trim().length === 0) {
      errors.name = "Project name cannot be empty.";
    } else if (name.trim().length > 150) {
      errors.name = "Project name must be less than or equal to 150 characters.";
    } else {
      updates.name = name.trim();
    }
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== "string") {
      errors.description = "Project description must be a string.";
    } else {
      updates.description =
        description === null || description.trim().length === 0
          ? null
          : description.trim();
    }
  }

  if (Object.keys(updates).length === 0 && Object.keys(errors).length === 0) {
    errors.body = "At least one field (name or description) must be provided.";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return updates;
}
