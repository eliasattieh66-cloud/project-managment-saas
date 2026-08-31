import {
  createTask,
  findTasksByProjectId,
  findTaskById,
  assignTask,
  updateTaskStatus,
} from "./task.repository.js";
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

export async function assignTaskInProject({ workspaceId, projectId, taskId, requesterId, userId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin", "member"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to assign tasks in this project.", 403);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const task = await findTaskById(taskId, projectId);

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const targetMembership = await findMembership(workspaceId, userId);

  if (!targetMembership) {
    throw new AppError("User must be a member of this workspace to be assigned this task.", 400);
  }

  const updatedTask = await assignTask({ taskId, projectId, assignedTo: userId });

  return updatedTask;
}

export async function updateTaskStatusInProject({ workspaceId, projectId, taskId, requesterId, status }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin", "member"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to update task status in this project.", 403);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const task = await findTaskById(taskId, projectId);

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const updatedTask = await updateTaskStatus({ taskId, projectId, status });

  return updatedTask;
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
