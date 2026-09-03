import { addAttachmentToTask, listAttachmentsForTask } from "./attachment.service.js";

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

export async function listAttachmentsController(req, res) {
  const attachments = await listAttachmentsForTask({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    requesterId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: {
      attachments,
    },
  });
}
