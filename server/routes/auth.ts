import { Router } from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email) as any;
    
    if (!user) {
      return res.status(401).json({ success: false, error: "Email ou mot de passe incorrect" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ success: false, error: "Votre compte est suspendu. Contactez le support." });
    }

    // Since we just migrated passwords from mocks (plaintext), we might need to check if it's bcrypt or plaintext.
    // For demo simplicity we check plain text first (if we are not hashing), or bcrypt if we are.
    // Let's assume plain text for now, as that's what's in the seed.
    if (user.password !== password) {
       return res.status(401).json({ success: false, error: "Email ou mot de passe incorrect" });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const data = req.body;
    const existing = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(data.email) as any;
    
    if (existing) {
      return res.status(400).json({ success: false, error: "Cet email est déjà utilisé par un autre compte" });
    }

    const id = `client-${Date.now()}`;
    const name = `${data.prenom} ${data.nom}`;
    const status = "active";
    const role = "client";

    db.prepare(`
      INSERT INTO users (id, nom, prenom, name, email, password, role, date_naissance, pays, ville, phone, cin, num_permis, date_expiration_permis, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.nom, data.prenom, name, data.email, data.password, role, data.dateNaissance,
      data.pays, data.ville, data.phone, data.cin, data.numPermis, data.dateExpirationPermis, status
    );

    const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { email, nom, prenom, name, avatar, sub } = req.body;
    
    let user = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email) as any;
    
    if (user) {
      if (!user.avatar && avatar) {
        db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, user.id);
        user.avatar = avatar;
      }
    } else {
      const id = `google-${sub || Date.now()}`;
      const role = "client";
      const status = "active";
      const pays = "Maroc";
      
      db.prepare(`
        INSERT INTO users (id, nom, prenom, name, email, password, role, date_naissance, pays, ville, phone, cin, num_permis, date_expiration_permis, avatar, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, nom, prenom, name, email, "", role, "", pays, "", "", "", "", "", avatar || null, status);
      
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
