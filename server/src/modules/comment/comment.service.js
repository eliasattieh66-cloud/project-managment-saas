import { addComment } from "./comment.repository.js";
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
