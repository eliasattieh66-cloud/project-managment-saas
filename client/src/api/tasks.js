import { apiRequest } from "./client.js";

function tasksUrl(workspaceId, projectId) {
  return `/workspaces/${workspaceId}/projects/${projectId}/tasks`;
}

export async function getTasks(workspaceId, projectId) {
  const data = await apiRequest(tasksUrl(workspaceId, projectId));
  return data.data.tasks;
}

export async function getTask(workspaceId, projectId, taskId) {
  const data = await apiRequest(`${tasksUrl(workspaceId, projectId)}/${taskId}`);
  return data.data.task;
}

export async function createTask(workspaceId, projectId, task) {
  const data = await apiRequest(tasksUrl(workspaceId, projectId), {
    method: "POST",
    body: JSON.stringify(task),
  });
  return data.data.task;
}

export async function updateTask(workspaceId, projectId, taskId, updates) {
  const data = await apiRequest(`${tasksUrl(workspaceId, projectId)}/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.data.task;
}

export async function updateTaskStatus(workspaceId, projectId, taskId, status) {
  const data = await apiRequest(
    `${tasksUrl(workspaceId, projectId)}/${taskId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  return data.data.task;
}

export async function assignTask(workspaceId, projectId, taskId, userId) {
  const data = await apiRequest(
    `${tasksUrl(workspaceId, projectId)}/${taskId}/assign`,
    {
      method: "PATCH",
      body: JSON.stringify({ userId }),
    }
  );
  return data.data.task;
}
