import { validateCreateProjectInput } from "./project.validation.js";
import {
  createProjectInWorkspace,
  listProjectsForWorkspace,
  getProjectById,
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
