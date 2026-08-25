import {
  createWorkspaceWithOwner,
  findWorkspacesByUserId,
  findMembership,
  addMember,
  findMembersByWorkspaceId,
} from "./workspace.repository.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

export async function createWorkspace({ name, ownerId }) {
  const workspace = await createWorkspaceWithOwner({
    name,
    ownerId,
  });

  return workspace;
}
export async function listWorkspacesForUser(userId) {
  const workspaces = await findWorkspacesByUserId(userId);

  return workspaces;
}

export async function addMemberToWorkspace({ workspaceId, requesterId, email, role }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to add members to this workspace.", 403);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("No user found with that email.", 404);
  }

  const existingMembership = await findMembership(workspaceId, user.id);

  if (existingMembership) {
    throw new AppError("User is already a member of this workspace.", 409);
  }

  const member = await addMember({ workspaceId, userId: user.id, role });

  return member;
}

export async function listMembersForWorkspace({ workspaceId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const members = await findMembersByWorkspaceId(workspaceId);

  return members;
}