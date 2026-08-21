import { createWorkspaceWithOwner,findWorkspacesByUserId, } from "./workspace.repository.js";

export async function createWorkspace({ name, ownerId }) {
  const workspace = await createWorkspaceWithOwner({
    name,
    ownerId,
  });

  return workspace;
}
export async function listWorkspacesForUser(userId) {
  const workspaces = await findWorkspacesByUserId(userId);

  return workspaces;
}