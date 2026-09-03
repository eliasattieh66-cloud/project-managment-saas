import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import workspaceRoutes from "./modules/workspace/workspace.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import attachmentRoutes from "./modules/attachment/attachment.routes.js";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Project Management SaaS API",
  });
});

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", projectRoutes);
app.use("/api/workspaces/:workspaceId/projects/:projectId/tasks", taskRoutes);
app.use(
  "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments",
  commentRoutes
);
app.use(
  "/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/attachments",
  attachmentRoutes
);
app.use(errorHandler);

export default app;