import {
  addAttachment,
  findAttachmentsByTaskId,
  findAttachmentById,
} from "./attachment.repository.js";
import { findMembership } from "../workspace/workspace.repository.js";
import { findProjectById } from "../project/project.repository.js";
import { findTaskById } from "../task/task.repository.js";
import { AppError } from "../../utils/AppError.js";

export async function addAttachmentToTask({ workspaceId, projectId, taskId, requesterId, file }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const task = await findTaskById(taskId, projectId);

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  if (!file) {
    throw new AppError("A file is required.", 400);
  }

  const attachment = await addAttachment({
    taskId,
    uploadedBy: requesterId,
    fileName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    fileSize: file.size,
  });

  return attachment;
}

export async function listAttachmentsForTask({ workspaceId, projectId, taskId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const task = await findTaskById(taskId, projectId);

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const attachments = await findAttachmentsByTaskId(taskId);

  return attachments;
}

export async function getAttachmentForDownload({
  workspaceId,
  projectId,
  taskId,
  attachmentId,
  requesterId,
}) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const task = await findTaskById(taskId, projectId);

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const attachment = await findAttachmentById(attachmentId, taskId);

  if (!attachment) {
    throw new AppError("Attachment not found.", 404);
  }

  return attachment;
}
