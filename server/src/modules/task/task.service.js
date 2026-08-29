import { createTask,findTasksByProjectId,findTaskById } from "./task.repository.js";
import { findMembership } from "../workspace/workspace.repository.js";
import { findProjectById } from "../project/project.repository.js";
import { AppError } from "../../utils/AppError.js";

export async function createTaskInProject({
  workspaceId,
  projectId,
  requesterId,
  title,
  description,
  priority,
  dueDate,
}) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin", "member"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to create a task in this project.", 403);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const task = await createTask({
    projectId,
    title,
    description,
    priority,
    dueDate,
    createdBy: requesterId,
  });

  return task;
}

export async function listTasksForProject({ workspaceId, projectId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const tasks = await findTasksByProjectId(projectId);

  return tasks;
}
export async function getTaskById({ workspaceId, projectId, taskId, requesterId }) {
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

  return task;
}
