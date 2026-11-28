import { pool } from "../src/db/pool.js";
import { generateAuthToken } from "../src/utils/token.js";

export async function clearDatabase() {
  await pool.query("TRUNCATE TABLE users, workspaces RESTART IDENTITY CASCADE");
}

export async function createUser({ name, email }) {
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password_hash, email_verified_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, name, email
    `,
    [name, email, "not-used-in-these-tests"]
  );

  const user = result.rows[0];

  return {
    user,
    token: generateAuthToken(user),
  };
}

export async function closeDatabase() {
  await pool.end();
}
