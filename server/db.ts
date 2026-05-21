import Database from "better-sqlite3";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = join(dbDir, "automaroc.db");
const db = new Database(dbPath);

// Initialize schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT,
      prenom TEXT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      date_naissance TEXT,
      pays TEXT,
      ville TEXT,
      phone TEXT,
      cin TEXT,
      num_permis TEXT,
      date_expiration_permis TEXT,
      avatar TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      name TEXT,
      brand TEXT,
      category TEXT,
      price_per_day INTEGER,
      image TEXT,
      available INTEGER,
      seats INTEGER,
      transmission TEXT,
      fuel TEXT,
      city TEXT,
      rating REAL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      icon TEXT,
      description TEXT,
      color TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      car_id TEXT,
      car_name TEXT,
      car_brand TEXT,
      car_image TEXT,
      price_per_day INTEGER,
      start_date TEXT,
      start_time TEXT,
      end_date TEXT,
      end_time TEXT,
      ville_depart TEXT,
      ville_retour TEXT,
      days INTEGER,
      total_price INTEGER,
      city TEXT,
      status TEXT,
      payment_method TEXT,
      payment_status TEXT,
      created_at TEXT,
      client_nom TEXT,
      client_prenom TEXT,
      client_email TEXT,
      client_phone TEXT,
      client_cin TEXT,
      client_num_permis TEXT,
      client_date_expiration_permis TEXT,
      client_status TEXT,
      refuse_reason TEXT,
      refuse_solution TEXT,
      remise_confirmed INTEGER,
      retour_confirmed INTEGER,
      return_inspection TEXT,
      final_price INTEGER,
      review_left INTEGER,
      voucher_generated INTEGER
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      title TEXT,
      message TEXT,
      read INTEGER,
      created_at TEXT,
      booking_id TEXT,
      refuse_reason TEXT,
      refuse_solution TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      user_id TEXT,
      user_name TEXT,
      car_id TEXT,
      rating INTEGER,
      comment TEXT,
      created_at TEXT,
      city TEXT,
      date TEXT,
      avatar TEXT,
      color TEXT
    );
  `);
}

export default db;
