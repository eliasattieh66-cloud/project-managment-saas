import { createProject } from "./project.repository.js";
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
