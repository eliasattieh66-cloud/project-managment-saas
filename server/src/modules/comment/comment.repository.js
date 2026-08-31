import { pool } from "../../db/pool.js";

export async function addComment({ taskId, userId, content }) {
  const result = await pool.query(
    `
    INSERT INTO comments (task_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING
      id,
      task_id,
      user_id,
      content,
      created_at,
      updated_at
    `,
    [taskId, userId, content]
  );

  return result.rows[0];
}
