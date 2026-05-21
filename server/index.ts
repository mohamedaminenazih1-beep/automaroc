import express from "express";
import cors from "cors";
import { initDB } from "./db.js";
import { seedDB } from "./seed.js";

import authRoutes from "./routes/auth.js";
import carsRoutes from "./routes/cars.js";
import bookingsRoutes from "./routes/bookings.js";
import categoriesRoutes from "./routes/categories.js";
import usersRoutes from "./routes/users.js";

// Initialize database
initDB();
seedDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
