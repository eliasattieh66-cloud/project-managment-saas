import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createWorkspaceController } from "./workspace.controller.js";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createWorkspaceController));

export default router;