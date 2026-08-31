import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createTaskController, listTasksController,getTaskController ,assignTaskController,updateTaskStatusController} from "./task.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, asyncHandler(createTaskController));
router.get("/", authenticate, asyncHandler(listTasksController));
router.get("/:taskId", authenticate, asyncHandler(getTaskController));
router.patch("/:taskId/assign", authenticate, asyncHandler(assignTaskController));
router.patch("/:taskId/status", authenticate, asyncHandler(updateTaskStatusController));
export default router;
