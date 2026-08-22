import {
  validateCreateWorkspaceInput,
  validateAddMemberInput,
} from "./workspace.validation.js";
import {
  createWorkspace,
  listWorkspacesForUser,
  addMemberToWorkspace,
} from "./workspace.service.js";

export async function createWorkspaceController(req, res) {
  const validatedData = validateCreateWorkspaceInput(req.body);

  const workspace = await createWorkspace({
    name: validatedData.name,
    ownerId: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: {
      workspace,
    },
  });
}

export async function listWorkspacesController(req, res) {
  const workspaces = await listWorkspacesForUser(req.user.id);

  res.status(200).json({
    status: "success",
    data: {
      workspaces,
    },
  });
}

export async function addMemberController(req, res) {
  const validatedData = validateAddMemberInput(req.body);

  const member = await addMemberToWorkspace({
    workspaceId: req.params.workspaceId,
    requesterId: req.user.id,
    email: validatedData.email,
    role: validatedData.role,
  });

  res.status(201).json({
    status: "success",
    data: {
      member,
    },
  });
}