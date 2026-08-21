import { pool } from "../../db/pool.js";

export async function createWorkspaceWithOwner({ name, ownerId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const workspaceResult = await client.query(
      `
      INSERT INTO workspaces (name, owner_id)
      VALUES ($1, $2)
      RETURNING
        id,
        name,
        owner_id,
        created_at,
        updated_at
      `,
      [name, ownerId]
    );

    const workspace = workspaceResult.rows[0];

    await client.query(
      `
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES ($1, $2, $3)
      `,
      [workspace.id, ownerId, "owner"]
    );

    await client.query("COMMIT");

    return workspace;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findWorkspacesByUserId(userId) {
  const result = await pool.query(
    `
    SELECT
      w.id,
      w.name,
      w.owner_id,
      wm.role,
      w.created_at,
      w.updated_at
    FROM workspaces w
    INNER JOIN workspace_members wm
      ON wm.workspace_id = w.id
    WHERE wm.user_id = $1
    ORDER BY w.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}