import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addAttachmentController,
  listAttachmentsController,
  downloadAttachmentController,
} from "./attachment.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, upload.single("file"), asyncHandler(addAttachmentController));
router.get("/", authenticate, asyncHandler(listAttachmentsController));
router.get("/:attachmentId/download", authenticate, asyncHandler(downloadAttachmentController));

export default router;
