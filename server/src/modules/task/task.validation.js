import { AppError } from "../../utils/AppError.js";

const ALLOWED_PRIORITIES = ["low", "medium", "high"];
const ALLOWED_STATUSES = ["todo", "in_progress", "done"];

export function validateCreateTaskInput({ title, description, priority, dueDate }) {
  const errors = {};

  if (title === undefined || title === null) {
    errors.title = "Task title is required.";
  } else if (typeof title !== "string") {
    errors.title = "Task title must be a string.";
  } else if (title.trim().length === 0) {
    errors.title = "Task title cannot be empty.";
  } else if (title.trim().length > 200) {
    errors.title = "Task title must be less than or equal to 200 characters.";
  }

  let normalizedDescription = null;
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      errors.description = "Task description must be a string.";
    } else {
      normalizedDescription = description.trim().length > 0 ? description.trim() : null;
    }
  }

  let normalizedPriority = "medium";
  if (priority !== undefined && priority !== null) {
    if (typeof priority !== "string" || !ALLOWED_PRIORITIES.includes(priority)) {
      errors.priority = `Priority must be one of: ${ALLOWED_PRIORITIES.join(", ")}.`;
    } else {
      normalizedPriority = priority;
    }
  }

  let normalizedDueDate = null;
  if (dueDate !== undefined && dueDate !== null) {
    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      errors.dueDate = "Due date must be a valid date.";
    } else {
      normalizedDueDate = parsedDate;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    title: title.trim(),
    description: normalizedDescription,
    priority: normalizedPriority,
    dueDate: normalizedDueDate,
  };
}

export function validateAssignTaskInput({ userId }) {
  const errors = {};

  if (userId === undefined || userId === null) {
    errors.userId = "userId is required.";
  } else if (
    (typeof userId !== "number" && typeof userId !== "string") ||
    String(userId).trim().length === 0 ||
    Number.isNaN(Number(userId))
  ) {
    errors.userId = "userId must be a valid number.";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    userId,
  };
}

export function validateUpdateTaskStatusInput({ status }) {
  const errors = {};

  if (status === undefined || status === null) {
    errors.status = "Status is required.";
  } else if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}.`;
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    status,
  };
}
