import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createProjectController,listProjectsController,getProjectController, updateProjectController } from "./project.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, asyncHandler(createProjectController));
router.get("/", authenticate, asyncHandler(listProjectsController));
router.get("/:projectId", authenticate, asyncHandler(getProjectController));
router.patch("/:projectId", authenticate, asyncHandler(updateProjectController));
export default router;
