import { apiRequest } from "./client.js";

export async function getWorkspaces() {
  const data = await apiRequest("/workspaces");
  return data.data.workspaces;
}

export async function getWorkspace(workspaceId) {
  const data = await apiRequest(`/workspaces/${workspaceId}`);
  return data.data.workspace;
}

export async function createWorkspace(name) {
  const data = await apiRequest("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data.data.workspace;
}

export async function getWorkspaceMembers(workspaceId) {
  const data = await apiRequest(`/workspaces/${workspaceId}/members`);
  return data.data.members;
}

export async function addWorkspaceMember(workspaceId, email, role) {
  const data = await apiRequest(`/workspaces/${workspaceId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return data.data.member;
}

export async function removeWorkspaceMember(workspaceId, userId) {
  await apiRequest(`/workspaces/${workspaceId}/members/${userId}`, {
    method: "DELETE",
  });
}
