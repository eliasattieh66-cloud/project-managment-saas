import { validateCreateTaskInput } from "./task.validation.js";
import { createTaskInProject,listTasksForProject} from "./task.service.js";

export async function createTaskController(req, res) {
  const validatedData = validateCreateTaskInput(req.body);

  const task = await createTaskInProject({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    requesterId: req.user.id,
    title: validatedData.title,
    description: validatedData.description,
    priority: validatedData.priority,
    dueDate: validatedData.dueDate,
  });

  res.status(201).json({
    status: "success",
    data: {
      task,
    },
  });
}
export async function listTasksController(req, res) {
  const tasks = await listTasksForProject({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    requesterId: req.user.id,
  });
  
  res.status(200).json({
    status: "success",
    data: {
      tasks,
    },
  });
}
