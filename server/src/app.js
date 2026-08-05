import express from "express";

const app = express();

const PORT = 5000;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});