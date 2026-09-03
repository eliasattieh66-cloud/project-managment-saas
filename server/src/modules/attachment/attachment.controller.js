import { addAttachmentToTask } from "./attachment.service.js";

export async function addAttachmentController(req, res) {
  const attachment = await addAttachmentToTask({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    requesterId: req.user.id,
    file: req.file,
  });

  res.status(201).json({
    status: "success",
    data: {
      attachment,
    },
  });
}
