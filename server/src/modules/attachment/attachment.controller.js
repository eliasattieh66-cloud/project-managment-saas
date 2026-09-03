import path from "path";
import {
  addAttachmentToTask,
  listAttachmentsForTask,
  getAttachmentForDownload,
} from "./attachment.service.js";
import { UPLOAD_DIRECTORY } from "../../middlewares/upload.middleware.js";

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

export async function downloadAttachmentController(req, res) {
  const attachment = await getAttachmentForDownload({
    workspaceId: req.params.workspaceId,
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    attachmentId: req.params.attachmentId,
    requesterId: req.user.id,
  });

  const filePath = path.join(UPLOAD_DIRECTORY, path.basename(attachment.file_url));

  res.download(filePath, attachment.file_name);
}
