import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    const cars = db.prepare("SELECT * FROM cars").all() as any[];
    // Convert available from 0/1 to boolean
    const mappedCars = cars.map(c => ({
      ...c,
      pricePerDay: c.price_per_day,
      available: c.available === 1,
    }));
    res.json(mappedCars);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const data = req.body;
    db.prepare(`
      INSERT INTO cars (id, name, brand, category, price_per_day, image, available, seats, transmission, fuel, city, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id, data.name, data.brand, data.category, data.pricePerDay, data.image,
      data.available ? 1 : 0, data.seats, data.transmission, data.fuel, data.city, data.rating || 0
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    db.prepare(`
      UPDATE cars
      SET name = ?, brand = ?, category = ?, price_per_day = ?, image = ?, available = ?, seats = ?, transmission = ?, fuel = ?, city = ?, rating = ?
      WHERE id = ?
    `).run(
      data.name, data.brand, data.category, data.pricePerDay, data.image,
      data.available ? 1 : 0, data.seats, data.transmission, data.fuel, data.city, data.rating || 0,
      id
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM cars WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
