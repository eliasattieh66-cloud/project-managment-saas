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
