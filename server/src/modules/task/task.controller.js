import { validateCreateTaskInput, validateAssignTaskInput } from "./task.validation.js";
import {
  createTaskInProject,
  listTasksForProject,
  getTaskById,
  assignTaskInProject,
} from "./task.service.js";

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
export async function getTaskController(req, res) {
  const task = await getTaskById({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    requesterId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
}

export async function assignTaskController(req, res) {
  const validatedData = validateAssignTaskInput(req.body);

  const task = await assignTaskInProject({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    requesterId: req.user.id,
    userId: validatedData.userId,
  });

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
}
