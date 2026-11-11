import { apiRequest } from "./client.js";

function projectsUrl(workspaceId) {
  return `/workspaces/${workspaceId}/projects`;
}

export async function getProjects(workspaceId) {
  const data = await apiRequest(projectsUrl(workspaceId));
  return data.data.projects;
}

export async function getProject(workspaceId, projectId) {
  const data = await apiRequest(`${projectsUrl(workspaceId)}/${projectId}`);
  return data.data.project;
}

export async function createProject(workspaceId, name, description) {
  const data = await apiRequest(projectsUrl(workspaceId), {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
  return data.data.project;
}

export async function updateProject(workspaceId, projectId, updates) {
  const data = await apiRequest(`${projectsUrl(workspaceId)}/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.data.project;
}

export async function archiveProject(workspaceId, projectId) {
  const data = await apiRequest(
    `${projectsUrl(workspaceId)}/${projectId}/archive`,
    {
      method: "PATCH",
    }
  );
  return data.data.project;
}
