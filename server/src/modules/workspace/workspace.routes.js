import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createWorkspaceController,
  listWorkspacesController,
  addMemberController,
  listMembersController,
} from "./workspace.controller.js";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createWorkspaceController));
router.get("/", authenticate, asyncHandler(listWorkspacesController));
router.post("/:workspaceId/members", authenticate, asyncHandler(addMemberController));
router.get("/:workspaceId/members", authenticate, asyncHandler(listMembersController));

export default router;