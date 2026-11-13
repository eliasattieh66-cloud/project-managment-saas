import { apiRequest, getToken, API_BASE_URL } from "./client.js";

function attachmentsUrl(workspaceId, projectId, taskId) {
  return `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`;
}

export async function getAttachments(workspaceId, projectId, taskId) {
  const data = await apiRequest(attachmentsUrl(workspaceId, projectId, taskId));
  return data.data.attachments;
}

export async function uploadAttachment(workspaceId, projectId, taskId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiRequest(attachmentsUrl(workspaceId, projectId, taskId), {
    method: "POST",
    body: formData,
  });
  return data.data.attachment;
}

export async function downloadAttachment(
  workspaceId,
  projectId,
  taskId,
  attachment
) {
  const response = await fetch(
    `${API_BASE_URL}${attachmentsUrl(workspaceId, projectId, taskId)}/${attachment.id}/download`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Could not download the file.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.file_name;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
