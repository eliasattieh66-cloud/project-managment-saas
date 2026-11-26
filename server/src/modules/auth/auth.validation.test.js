import { describe, test, expect } from "vitest";
import {
  validateRegisterInput,
  validateLoginInput,
  validateResetPasswordInput,
} from "./auth.validation.js";

describe("validateRegisterInput", () => {
  const validInput = {
    name: "Elias",
    email: "elias@example.com",
    password: "password123",
    turnstileToken: "test-token",
  };

  test("accepts valid input", () => {
    const result = validateRegisterInput(validInput);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("rejects a missing name", () => {
    const result = validateRegisterInput({ ...validInput, name: "" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Name is required.");
  });

  test("rejects a name made only of spaces", () => {
    const result = validateRegisterInput({ ...validInput, name: "   " });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Name is required.");
  });

  test("rejects an email without @", () => {
    const result = validateRegisterInput({ ...validInput, email: "elias.example.com" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Email must be a valid email address.");
  });

  test("rejects a password of 7 characters", () => {
    const result = validateRegisterInput({ ...validInput, password: "1234567" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters long.");
  });

  test("accepts a password of exactly 8 characters", () => {
    const result = validateRegisterInput({ ...validInput, password: "12345678" });

    expect(result.isValid).toBe(true);
  });

  test("rejects a missing human verification token", () => {
    const result = validateRegisterInput({ ...validInput, turnstileToken: "" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Please complete the human verification check.");
  });

  test("returns one error for each broken rule", () => {
    const result = validateRegisterInput({});

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(4);
  });
});

describe("validateLoginInput", () => {
  test("accepts an email and a password", () => {
    const result = validateLoginInput({
      email: "elias@example.com",
      password: "anything",
    });

    expect(result.isValid).toBe(true);
  });

  test("rejects a missing password", () => {
    const result = validateLoginInput({ email: "elias@example.com" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password is required.");
  });
});

describe("validateResetPasswordInput", () => {
  const validToken = "a".repeat(64);

  test("accepts a valid token and password", () => {
    const result = validateResetPasswordInput({
      token: validToken,
      password: "newpassword123",
    });

    expect(result.isValid).toBe(true);
  });

  test("rejects a token that is too short", () => {
    const result = validateResetPasswordInput({
      token: "abc123",
      password: "newpassword123",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Reset token is invalid.");
  });

  test("rejects a short new password", () => {
    const result = validateResetPasswordInput({
      token: validToken,
      password: "short",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters long.");
  });
});
