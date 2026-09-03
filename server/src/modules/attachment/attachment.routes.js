import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addAttachmentController } from "./attachment.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, upload.single("file"), asyncHandler(addAttachmentController));

export default router;
