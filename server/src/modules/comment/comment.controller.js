import { validateAddCommentInput } from "./comment.validation.js";
import { addCommentToTask, listCommentsForTask } from "./comment.service.js";

export async function addCommentController(req, res) {
  const validatedData = validateAddCommentInput(req.body);

  const comment = await addCommentToTask({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    requesterId: req.user.id,
    content: validatedData.content,
  });

  res.status(201).json({
    status: "success",
    data: {
      comment,
    },
  });
}

export async function listCommentsController(req, res) {
  const comments = await listCommentsForTask({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    requesterId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: {
      comments,
    },
  });
}
