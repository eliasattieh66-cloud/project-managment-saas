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

export async function findCommentsByTaskId(taskId) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.task_id,
      c.user_id,
      u.name AS author_name,
      c.content,
      c.created_at,
      c.updated_at
    FROM comments c
    INNER JOIN users u
      ON u.id = c.user_id
    WHERE c.task_id = $1
    ORDER BY c.created_at ASC
    `,
    [taskId]
  );

  return result.rows;
}
