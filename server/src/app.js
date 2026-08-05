import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Project Management SaaS API",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend API is running",
  });
});

export default app;