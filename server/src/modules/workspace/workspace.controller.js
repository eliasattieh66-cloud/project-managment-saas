import { validateCreateWorkspaceInput } from "./workspace.validation.js";
import {
  createWorkspace,
  listWorkspacesForUser,
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