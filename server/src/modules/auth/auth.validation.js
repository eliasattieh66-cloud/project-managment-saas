function isEmpty(value) {
  return typeof value !== "string" || value.trim().length === 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput(data) {
  const errors = [];

  if (isEmpty(data.name)) {
    errors.push("Name is required.");
  }

  if (isEmpty(data.email)) {
    errors.push("Email is required.");
  } else if (!isValidEmail(data.email)) {
    errors.push("Email must be a valid email address.");
  }

  if (isEmpty(data.password)) {
    errors.push("Password is required.");
  } else if (data.password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoginInput(data) {
  const errors = [];

  if (isEmpty(data.email)) {
    errors.push("Email is required.");
  } else if (!isValidEmail(data.email)) {
    errors.push("Email must be a valid email address.");
  }

  if (isEmpty(data.password)) {
    errors.push("Password is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}