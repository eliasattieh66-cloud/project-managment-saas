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

export async function findCommentById(commentId, taskId) {
  const result = await pool.query(
    `
    SELECT id, task_id, user_id, content, created_at, updated_at
    FROM comments
    WHERE id = $1 AND task_id = $2
    `,
    [commentId, taskId]
  );

  return result.rows[0] || null;
}

export async function updateComment({ commentId, taskId, content }) {
  const result = await pool.query(
    `
    UPDATE comments
    SET content = $1, updated_at = NOW()
    WHERE id = $2 AND task_id = $3
    RETURNING id, task_id, user_id, content, created_at, updated_at
    `,
    [content, commentId, taskId]
  );

  return result.rows[0];
}

export async function deleteComment({ commentId, taskId }) {
  await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1 AND task_id = $2
    `,
    [commentId, taskId]
  );
}
