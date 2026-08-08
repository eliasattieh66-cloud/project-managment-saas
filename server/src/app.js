import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Project Management SaaS API",
  });
});

app.use("/health", healthRoutes);

export default app;