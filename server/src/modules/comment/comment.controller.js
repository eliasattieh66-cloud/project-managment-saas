import { validateAddCommentInput } from "./comment.validation.js";
import { addCommentToTask } from "./comment.service.js";

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
