import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Project Management SaaS API",
  });
});

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);

export default app;