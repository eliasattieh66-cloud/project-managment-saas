import { validateCreateProjectInput } from "./project.validation.js";
import { createProjectInWorkspace } from "./project.service.js";

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
