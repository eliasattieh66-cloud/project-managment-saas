import { createWorkspaceWithOwner } from "./workspace.repository.js";

export async function createWorkspace({ name, ownerId }) {
  const workspace = await createWorkspaceWithOwner({
    name,
    ownerId,
  });

  return workspace;
}