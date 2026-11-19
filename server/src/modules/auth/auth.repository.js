import { pool } from "../../db/pool.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      email_verified_at,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING
      id,
      name,
      email,
      created_at,
      updated_at
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

export async function replaceVerificationToken({ userId, tokenHash, expiresAt }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM email_verification_tokens
      WHERE user_id = $1
      `,
      [userId]
    );

    await client.query(
      `
      INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      `,
      [userId, tokenHash, expiresAt]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findValidVerificationToken(tokenHash) {
  const result = await pool.query(
    `
    SELECT id, user_id, expires_at
    FROM email_verification_tokens
    WHERE token_hash = $1 AND expires_at > NOW()
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
}

export async function markEmailVerified(userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
      UPDATE users
      SET email_verified_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [userId]
    );

    await client.query(
      `
      DELETE FROM email_verification_tokens
      WHERE user_id = $1
      `,
      [userId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
