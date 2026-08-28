import { validateCreateProjectInput, validateUpdateProjectInput } from "./project.validation.js";
import {
  createProjectInWorkspace,
  listProjectsForWorkspace,
  getProjectById,
  updateProjectInWorkspace,
  archiveProjectInWorkspace
} from "./project.service.js";

export async function createProjectController(req, res) {
  const validatedData = validateCreateProjectInput(req.body);

  const project = await createProjectInWorkspace({
    workspaceId: req.params.workspaceId,
    requesterId: req.user.id,
    name: validatedData.name,
    description: validatedData.description,
  });

  res.status(201).json({
    status: "success",
    data: {
      project,
    },
  });
}
export async function listProjectsController(req, res) {
  const projects = await listProjectsForWorkspace({
    workspaceId: req.params.workspaceId,
    requesterId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: {
      projects,
    },
  });
}

export async function getProjectController(req, res) {
  const project = await getProjectById({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    requesterId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
}

export async function updateProjectController(req, res) {
  const updates = validateUpdateProjectInput(req.body);

  const project = await updateProjectInWorkspace({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    requesterId: req.user.id,
    updates,
  });

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
}

export async function archiveProjectController(req, res) {
  const project = await archiveProjectInWorkspace({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    requesterId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
}
