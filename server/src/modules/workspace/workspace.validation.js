import { AppError } from "../../utils/AppError.js";

const ALLOWED_MEMBER_ROLES = ["admin", "member", "viewer"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

export function validateAddMemberInput({ email, role }) {
  const errors = {};

  if (typeof email !== "string" || email.trim().length === 0) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email.trim())) {
    errors.email = "Email must be a valid email address.";
  }

  let normalizedRole = "member";
  if (role !== undefined && role !== null) {
    if (typeof role !== "string" || !ALLOWED_MEMBER_ROLES.includes(role)) {
      errors.role = `Role must be one of: ${ALLOWED_MEMBER_ROLES.join(", ")}.`;
    } else {
      normalizedRole = role;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    email: email.trim().toLowerCase(),
    role: normalizedRole,
  };
}