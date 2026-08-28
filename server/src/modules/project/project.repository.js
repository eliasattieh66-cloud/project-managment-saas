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

export async function findProjectsByWorkspaceId(workspaceId) {
  const result = await pool.query(
    `
    SELECT
      id,
      workspace_id,
      name,
      description,
      status,
      created_by,
      created_at,
      updated_at
    FROM projects
    WHERE workspace_id = $1
    ORDER BY created_at DESC
    `,
    [workspaceId]
  );

  return result.rows;
}

export async function findProjectById(projectId, workspaceId) {
  const result = await pool.query(
    `
    SELECT
      id,
      workspace_id,
      name,
      description,
      status,
      created_by,
      created_at,
      updated_at
    FROM projects
    WHERE id = $1 AND workspace_id = $2
    `,
    [projectId, workspaceId]
  );

  return result.rows[0] || null;
}

export async function updateProject({ projectId, workspaceId, name, description }) {
  const result = await pool.query(
    `
    UPDATE projects
    SET name = $1, description = $2, updated_at = NOW()
    WHERE id = $3 AND workspace_id = $4
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
    [name, description, projectId, workspaceId]
  );

  return result.rows[0];
}

export async function archiveProject({ projectId, workspaceId }) {
  const result = await pool.query(
    `
    UPDATE projects
    SET status = 'archived', updated_at = NOW()
    WHERE id = $1 AND workspace_id = $2
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
    [projectId, workspaceId]
  );

  return result.rows[0];
}
