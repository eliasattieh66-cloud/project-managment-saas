import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addCommentController } from "./comment.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, asyncHandler(addCommentController));

export default router;
