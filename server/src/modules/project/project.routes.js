import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createProjectController } from "./project.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, asyncHandler(createProjectController));

export default router;
