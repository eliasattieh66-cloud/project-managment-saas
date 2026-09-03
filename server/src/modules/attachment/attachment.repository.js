import { pool } from "../../db/pool.js";

export async function addAttachment({ taskId, uploadedBy, fileName, fileUrl, fileType, fileSize }) {
  const result = await pool.query(
    `
    INSERT INTO attachments (task_id, uploaded_by, file_name, file_url, file_type, file_size)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      task_id,
      uploaded_by,
      file_name,
      file_url,
      file_type,
      file_size,
      created_at
    `,
    [taskId, uploadedBy, fileName, fileUrl, fileType, fileSize]
  );

  return result.rows[0];
}

export async function findAttachmentsByTaskId(taskId) {
  const result = await pool.query(
    `
    SELECT
      a.id,
      a.task_id,
      a.uploaded_by,
      u.name AS uploaded_by_name,
      a.file_name,
      a.file_url,
      a.file_type,
      a.file_size,
      a.created_at
    FROM attachments a
    INNER JOIN users u
      ON u.id = a.uploaded_by
    WHERE a.task_id = $1
    ORDER BY a.created_at DESC
    `,
    [taskId]
  );

  return result.rows;
}
