import { AppError } from "../../utils/AppError.js";

export function validateAddCommentInput({ content }) {
  const errors = {};

  if (content === undefined || content === null) {
    errors.content = "Comment content is required.";
  } else if (typeof content !== "string") {
    errors.content = "Comment content must be a string.";
  } else if (content.trim().length === 0) {
    errors.content = "Comment content cannot be empty.";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    content: content.trim(),
  };
}
export function validateUpdateCommentInput({ content }) {
  const errors = {};
  
  if (content === undefined || content === null) {
    errors.content = "Comment content is required.";
  } else if (typeof content !== "string") {
    errors.content = "Comment content must be a string.";
  } else if (content.trim().length === 0) {
    errors.content = "Comment content cannot be empty.";
  }
  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    content: content.trim(),
  };
}