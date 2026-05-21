import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const users = db.prepare("SELECT * FROM users").all() as any[];
    res.json(users.map(u => ({
      ...u,
      dateNaissance: u.date_naissance,
      numPermis: u.num_permis,
      dateExpirationPermis: u.date_expiration_permis
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
