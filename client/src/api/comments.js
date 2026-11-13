import { apiRequest } from "./client.js";

function commentsUrl(workspaceId, projectId, taskId) {
  return `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`;
}

export async function getComments(workspaceId, projectId, taskId) {
  const data = await apiRequest(commentsUrl(workspaceId, projectId, taskId));
  return data.data.comments;
}

export async function addComment(workspaceId, projectId, taskId, content) {
  const data = await apiRequest(commentsUrl(workspaceId, projectId, taskId), {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return data.data.comment;
}

export async function updateComment(
  workspaceId,
  projectId,
  taskId,
  commentId,
  content
) {
  const data = await apiRequest(
    `${commentsUrl(workspaceId, projectId, taskId)}/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }
  );
  return data.data.comment;
}

export async function deleteComment(workspaceId, projectId, taskId, commentId) {
  await apiRequest(`${commentsUrl(workspaceId, projectId, taskId)}/${commentId}`, {
    method: "DELETE",
  });
}
