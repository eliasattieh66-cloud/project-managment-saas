import {
  addComment,
  findCommentsByTaskId,
  findCommentById,
  updateComment,
} from "./comment.repository.js";
import { findMembership } from "../workspace/workspace.repository.js";
import { findProjectById } from "../project/project.repository.js";
import { findTaskById } from "../task/task.repository.js";
import { AppError } from "../../utils/AppError.js";

export async function addCommentToTask({ workspaceId, projectId, taskId, requesterId, content }) {
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

  const comment = await addComment({
    taskId,
    userId: requesterId,
    content,
  });

  return comment;
}

export async function listCommentsForTask({ workspaceId, projectId, taskId, requesterId }) {
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

  const comments = await findCommentsByTaskId(taskId);

  return comments;
}

export async function updateCommentInTask({
  workspaceId,
  projectId,
  taskId,
  commentId,
  requesterId,
  content,
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

  const existingComment = await findCommentById(commentId, taskId);

  if (!existingComment) {
    throw new AppError("Comment not found.", 404);
  }

  if (existingComment.user_id !== requesterId) {
    throw new AppError("You can only edit your own comments.", 403);
  }

  const comment = await updateComment({ commentId, taskId, content });

  return comment;
}
