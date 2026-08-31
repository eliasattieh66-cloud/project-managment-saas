import { pool } from "../../db/pool.js";

export async function createTask({ projectId, title, description, priority, dueDate, createdBy }) {
  const result = await pool.query(
    `
    INSERT INTO tasks (project_id, title, description, priority, due_date, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by,
      due_date,
      created_at,
      updated_at
    `,
    [projectId, title, description, priority, dueDate, createdBy]
  );

  return result.rows[0];
}

export async function findTasksByProjectId(projectId) {
  const result = await pool.query(
    `
    SELECT
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by,
      due_date,
      created_at,
      updated_at
    FROM tasks
    WHERE project_id = $1
    ORDER BY created_at DESC
    `,
    [projectId]
  );

  return result.rows;
}

export async function findTaskById(taskId, projectId) {
  const result = await pool.query(
    `
    SELECT
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by,
      due_date,
      created_at,
      updated_at
    FROM tasks
    WHERE id = $1 AND project_id = $2
    `,
    [taskId, projectId]
  );

  return result.rows[0] || null;
}

export async function assignTask({ taskId, projectId, assignedTo }) {
  const result = await pool.query(
    `
    UPDATE tasks
    SET assigned_to = $1, updated_at = NOW()
    WHERE id = $2 AND project_id = $3
    RETURNING
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by,
      due_date,
      created_at,
      updated_at
    `,
    [assignedTo, taskId, projectId]
  );

  return result.rows[0];
}

export async function updateTaskStatus({ taskId, projectId, status }) {
  const result = await pool.query(
    `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND project_id = $3
    RETURNING
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      created_by,
      due_date,
      created_at,
      updated_at
    `,
    [status, taskId, projectId]
  );

  return result.rows[0];
}
