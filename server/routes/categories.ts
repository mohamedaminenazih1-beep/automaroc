import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const categories = db.prepare("SELECT * FROM categories").all() as any[];
    res.json(categories.map(c => ({
      ...c,
      createdAt: c.created_at
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
