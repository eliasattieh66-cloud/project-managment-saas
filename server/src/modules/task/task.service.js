import fs from "fs/promises";
import path from "path";
import {
  createTask,
  findTasksByProjectId,
  findTaskById,
  assignTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "./task.repository.js";
import { findMembership } from "../workspace/workspace.repository.js";
import { findProjectById } from "../project/project.repository.js";
import { findAttachmentsByTaskId } from "../attachment/attachment.repository.js";
import { UPLOAD_DIRECTORY } from "../../middlewares/upload.middleware.js";
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

  if (userId !== null) {
    const targetMembership = await findMembership(workspaceId, userId);

    if (!targetMembership) {
      throw new AppError("User must be a member of this workspace to be assigned this task.", 400);
    }
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

export async function updateTaskInProject({ workspaceId, projectId, taskId, requesterId, updates }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin", "member"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to update tasks in this project.", 403);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  const existingTask = await findTaskById(taskId, projectId);

  if (!existingTask) {
    throw new AppError("Task not found.", 404);
  }

  const updatedTask = await updateTask({
    taskId,
    projectId,
    title: updates.title !== undefined ? updates.title : existingTask.title,
    description: updates.description !== undefined ? updates.description : existingTask.description,
    priority: updates.priority !== undefined ? updates.priority : existingTask.priority,
    dueDate: updates.dueDate !== undefined ? updates.dueDate : existingTask.due_date,
  });

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

export async function deleteTaskFromProject({ workspaceId, projectId, taskId, requesterId }) {
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

  const isCreator =
    String(task.created_by) === String(requesterId) &&
    requesterMembership.role !== "viewer";
  const isManager = ["owner", "admin"].includes(requesterMembership.role);

  if (!isCreator && !isManager) {
    throw new AppError("You can only delete tasks you created.", 403);
  }

  const attachments = await findAttachmentsByTaskId(taskId);

  await deleteTask({ taskId, projectId });

  for (const attachment of attachments) {
    const filePath = path.join(UPLOAD_DIRECTORY, path.basename(attachment.file_url));

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Could not delete file ${filePath}:`, error);
      }
    }
  }
}
