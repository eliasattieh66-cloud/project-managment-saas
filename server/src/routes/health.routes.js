import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend API is running",
  });
});

router.get("/database", async (req, res) => {
  const result = await pool.query("SELECT NOW()");

  res.status(200).json({
    status: "ok",
    databaseTime: result.rows[0].now,
  });
});

export default router;