import {
  createWorkspaceWithOwner,
  findWorkspacesByUserId,
  findMembership,
  addMember,
  findMembersByWorkspaceId,
  findWorkspaceById,
  removeMemberAndUnassignTasks,
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

export async function getWorkspaceById({ workspaceId, requesterId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  const workspace = await findWorkspaceById(workspaceId);

  return workspace;
}

export async function removeMemberFromWorkspace({ workspaceId, requesterId, userId }) {
  const requesterMembership = await findMembership(workspaceId, requesterId);

  if (!requesterMembership) {
    throw new AppError("Workspace not found.", 404);
  }

  if (!["owner", "admin"].includes(requesterMembership.role)) {
    throw new AppError("You do not have permission to remove members from this workspace.", 403);
  }

  if (String(userId) === String(requesterId)) {
    throw new AppError("You cannot remove yourself from the workspace.", 400);
  }

  const targetMembership = await findMembership(workspaceId, userId);

  if (!targetMembership) {
    throw new AppError("Member not found.", 404);
  }

  if (targetMembership.role === "owner") {
    throw new AppError("The workspace owner cannot be removed.", 403);
  }

  if (targetMembership.role === "admin" && requesterMembership.role !== "owner") {
    throw new AppError("Only the workspace owner can remove an admin.", 403);
  }

  await removeMemberAndUnassignTasks({ workspaceId, userId });
}
