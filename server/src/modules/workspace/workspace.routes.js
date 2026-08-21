import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createWorkspaceController,listWorkspacesController } from "./workspace.controller.js";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createWorkspaceController));
router.get("/", authenticate, asyncHandler(listWorkspacesController));
export default router;