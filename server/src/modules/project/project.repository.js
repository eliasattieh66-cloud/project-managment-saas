import { pool } from "../../db/pool.js";

export async function createProject({ workspaceId, name, description, createdBy }) {
  const result = await pool.query(
    `
    INSERT INTO projects (workspace_id, name, description, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      workspace_id,
      name,
      description,
      status,
      created_by,
      created_at,
      updated_at
    `,
    [workspaceId, name, description, createdBy]
  );

  return result.rows[0];
}
