import db from "./db.js";
import { mockUsers } from "../src/mocks/auth.js";
import { allMockCars } from "../src/mocks/extendedCars.js";
import { mockInitialCategories } from "../src/mocks/categories.js";
import { mockInitialBookings, mockAdminExtraBookings, mockInitialNotifications, mockInitialReviews } from "../src/mocks/bookings.js";
import { mockReviews } from "../src/mocks/reviews.js";

export function seedDB() {
  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  
  if (usersCount.count > 0) {
    return; // Already seeded
  }

  console.log("Seeding database with initial mock data...");

  const insertUser = db.prepare(`
    INSERT INTO users (id, nom, prenom, name, email, password, role, date_naissance, pays, ville, phone, cin, num_permis, date_expiration_permis, avatar, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of mockUsers) {
    insertUser.run(
      u.id, u.nom, u.prenom, u.name, u.email, u.password, u.role, u.dateNaissance,
      u.pays, u.ville, u.phone, u.cin, u.numPermis, u.dateExpirationPermis, u.avatar || null, u.status
    );
  }

  const insertCar = db.prepare(`
    INSERT INTO cars (id, name, brand, category, price_per_day, image, available, seats, transmission, fuel, city, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of allMockCars) {
    insertCar.run(
      c.id, c.name, c.brand, c.category, c.pricePerDay, c.image,
      c.available ? 1 : 0, c.seats, c.transmission, c.fuel, c.city, c.rating || 0
    );
  }

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, icon, description, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const cat of mockInitialCategories) {
    insertCategory.run(cat.id, cat.name, cat.icon, cat.description, cat.color, cat.createdAt);
  }

  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, user_id, car_id, car_name, car_brand, car_image, price_per_day,
      start_date, start_time, end_date, end_time, ville_depart, ville_retour,
      days, total_price, city, status, payment_method, payment_status, created_at,
      client_nom, client_prenom, client_email, client_phone, client_cin, client_num_permis,
      client_date_expiration_permis, client_status, refuse_reason, refuse_solution,
      remise_confirmed, retour_confirmed, return_inspection, final_price, review_left, voucher_generated
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const allBookings = [...mockInitialBookings, ...mockAdminExtraBookings];
  for (const b of allBookings) {
    insertBooking.run(
      b.id, b.userId, b.carId, b.carName, b.carBrand, b.carImage, b.pricePerDay,
      b.startDate, b.startTime, b.endDate, b.endTime, b.villeDepart, b.villeRetour,
      b.days, b.totalPrice, b.city, b.status, b.paymentMethod, b.paymentStatus, b.createdAt,
      b.clientNom, b.clientPrenom, b.clientEmail, b.clientPhone, b.clientCIN, b.clientNumPermis,
      b.clientDateExpirationPermis, b.clientStatus, b.refuseReason || null, b.refuseSolution || null,
      b.remiseConfirmed ? 1 : 0, b.retourConfirmed ? 1 : 0,
      b.returnInspection ? JSON.stringify(b.returnInspection) : null,
      b.finalPrice || null, b.reviewLeft ? 1 : 0, b.voucherGenerated ? 1 : 0
    );
  }

  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, read, created_at, booking_id, refuse_reason, refuse_solution)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const n of mockInitialNotifications) {
    insertNotification.run(
      n.id, n.userId, n.type, n.title, n.message, n.read ? 1 : 0, n.createdAt,
      n.bookingId || null, n.refuseReason || null, n.refuseSolution || null
    );
  }

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, booking_id, user_id, user_name, car_id, rating, comment, created_at, city, date, avatar, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of mockInitialReviews) {
    insertReview.run(r.id, r.bookingId, r.userId, r.userName, r.carId, r.rating, r.comment, r.createdAt, null, null, null, null);
  }

  for (const r of mockReviews) {
    insertReview.run(r.id, null, null, r.name, null, r.rating, r.comment, null, r.city, r.date, r.avatar, r.color);
  }

  console.log("Database seeded successfully!");
}
