import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addCommentController,
  listCommentsController,
  updateCommentController,
  deleteCommentController,
} from "./comment.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, asyncHandler(addCommentController));
router.get("/", authenticate, asyncHandler(listCommentsController));
router.patch("/:commentId", authenticate, asyncHandler(updateCommentController));
router.delete("/:commentId", authenticate, asyncHandler(deleteCommentController));

export default router;
