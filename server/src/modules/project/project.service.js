import {
  createProject,
  findProjectsByWorkspaceId,
  findProjectById,
  updateProject,
  archiveProject,
} from "./project.repository.js";
import { findMembership } from "../workspace/workspace.repository.js";
import { AppError } from "../../utils/AppError.js";

export async function createProjectInWorkspace({ workspaceId, requesterId, name, description }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin", "member"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to create a project in this workspace.", 403);
  }

  const project = await createProject({
    workspaceId,
    name,
    description,
    createdBy: requesterId,
  });

  return project;
}

export async function listProjectsForWorkspace({ workspaceId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const projects = await findProjectsByWorkspaceId(workspaceId);

  return projects;
}

export async function getProjectById({ workspaceId, projectId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const project = await findProjectById(projectId, workspaceId);

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  return project;
}

export async function archiveProjectInWorkspace({ workspaceId, projectId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to archive projects in this workspace.", 403);
  }

  const existingProject = await findProjectById(projectId, workspaceId);

  if (!existingProject) {
    throw new AppError("Project not found.", 404);
  }

  if (existingProject.status === "archived") {
    throw new AppError("Project is already archived.", 409);
  }

  const project = await archiveProject({ projectId, workspaceId });

  return project;
}

export async function updateProjectInWorkspace({ workspaceId, projectId, requesterId, updates }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin", "member"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to update projects in this workspace.", 403);
  }

  const existingProject = await findProjectById(projectId, workspaceId);

  if (!existingProject) {
    throw new AppError("Project not found.", 404);
  }

  const project = await updateProject({
    projectId,
    workspaceId,
    name: updates.name !== undefined ? updates.name : existingProject.name,
    description: updates.description !== undefined ? updates.description : existingProject.description,
  });

  return project;
}
