import { Router } from "express";
import db from "../db.js";

const router = Router();

function mapBooking(b: any) {
  return {
    ...b,
    userId: b.user_id,
    carId: b.car_id,
    carName: b.car_name,
    carBrand: b.car_brand,
    carImage: b.car_image,
    pricePerDay: b.price_per_day,
    startDate: b.start_date,
    startTime: b.start_time,
    endDate: b.end_date,
    endTime: b.end_time,
    villeDepart: b.ville_depart,
    villeRetour: b.ville_retour,
    totalPrice: b.total_price,
    paymentMethod: b.payment_method,
    paymentStatus: b.payment_status,
    createdAt: b.created_at,
    clientNom: b.client_nom,
    clientPrenom: b.client_prenom,
    clientEmail: b.client_email,
    clientPhone: b.client_phone,
    clientCIN: b.client_cin,
    clientNumPermis: b.client_num_permis,
    clientDateExpirationPermis: b.client_date_expiration_permis,
    clientStatus: b.client_status,
    refuseReason: b.refuse_reason,
    refuseSolution: b.refuse_solution,
    remiseConfirmed: b.remise_confirmed === 1,
    retourConfirmed: b.retour_confirmed === 1,
    returnInspection: b.return_inspection ? JSON.parse(b.return_inspection) : undefined,
    finalPrice: b.final_price,
    reviewLeft: b.review_left === 1,
    voucherGenerated: b.voucher_generated === 1,
  };
}

router.get("/", (req, res) => {
  try {
    const bookings = db.prepare("SELECT * FROM bookings").all() as any[];
    res.json(bookings.map(mapBooking));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const data = req.body;
    db.prepare(`
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
    `).run(
      data.id, data.userId, data.carId, data.carName, data.carBrand, data.carImage, data.pricePerDay,
      data.startDate, data.startTime, data.endDate, data.endTime, data.villeDepart, data.villeRetour,
      data.days, data.totalPrice, data.city, data.status, data.paymentMethod, data.paymentStatus, data.createdAt,
      data.clientNom, data.clientPrenom, data.clientEmail, data.clientPhone, data.clientCIN, data.clientNumPermis,
      data.clientDateExpirationPermis, data.clientStatus, data.refuseReason || null, data.refuseSolution || null,
      data.remiseConfirmed ? 1 : 0, data.retourConfirmed ? 1 : 0,
      data.returnInspection ? JSON.stringify(data.returnInspection) : null,
      data.finalPrice || null, data.reviewLeft ? 1 : 0, data.voucherGenerated ? 1 : 0
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
      UPDATE bookings SET
        status = ?, payment_status = ?, refuse_reason = ?, refuse_solution = ?,
        remise_confirmed = ?, retour_confirmed = ?, return_inspection = ?, final_price = ?,
        review_left = ?, voucher_generated = ?
      WHERE id = ?
    `).run(
      data.status, data.paymentStatus, data.refuseReason || null, data.refuseSolution || null,
      data.remiseConfirmed ? 1 : 0, data.retourConfirmed ? 1 : 0,
      data.returnInspection ? JSON.stringify(data.returnInspection) : null,
      data.finalPrice || null, data.reviewLeft ? 1 : 0, data.voucherGenerated ? 1 : 0,
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
    db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
