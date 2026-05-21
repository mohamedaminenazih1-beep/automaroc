import { useState } from "react";
import { useBooking, REFUSE_REASONS } from "@/contexts/BookingContext";
import { allMockCars } from "@/mocks/extendedCars";
import type { BookingItem } from "@/mocks/bookings";

export type BookingStatus = BookingItem["status"];

// ── helpers ──────────────────────────────────────────────────────────────
function daysCount(start: string, end: string): number {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

function hasOverlap(bookings: BookingItem[], carId: string, start: string, end: string, excludeId?: string): boolean {
  return bookings.some((b) => {
    if (b.id === excludeId) return false;
    if (b.carId !== carId) return false;
    if (b.status === "cancelled" || b.status === "refused" || b.status === "completed") return false;
    const bS = new Date(b.startDate).getTime();
    const bE = new Date(b.endDate).getTime();
    const nS = new Date(start).getTime();
    const nE = new Date(end).getTime();
    return nS < bE && nE > bS;
  });
}

interface ValidationResult {
  canValidate: boolean;
  checks: { label: string; ok: boolean }[];
}

function checkCanValidate(booking: BookingItem, all: BookingItem[]): ValidationResult {
  const today = new Date(); today.setHours(0,0,0,0);
  const car = allMockCars.find((c) => c.id === booking.carId);
  const checks = [
    { label: "Client actif (non suspendu)",          ok: booking.clientStatus !== "suspended" },
    { label: "Voiture disponible (non en maintenance)",  ok: !!car?.available },
    { label: "Aucun chevauchement de dates",          ok: !hasOverlap(all, booking.carId, booking.startDate, booking.endDate, booking.id) },
    { label: "Date de début non dépassée",            ok: new Date(booking.startDate) >= today },
    { label: "Durée valide (≥ 1 jour)",              ok: daysCount(booking.startDate, booking.endDate) >= 1 },
    { label: "Permis de conduire valide (non expiré)", ok: new Date(booking.clientDateExpirationPermis) >= today },
  ];
  return { canValidate: checks.every((c) => c.ok), checks };
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "En cours",   color: "text-orange-700", bg: "bg-orange-50" },
  completed: { label: "Terminée",   color: "text-gray-600",   bg: "bg-gray-100" },
  pending:   { label: "En attente", color: "text-yellow-700", bg: "bg-yellow-50" },
  cancelled: { label: "Annulée",    color: "text-red-600",    bg: "bg-red-50" },
  confirmed: { label: "Confirmée",  color: "text-green-700",  bg: "bg-green-100" },
  refused:   { label: "Refusée",    color: "text-red-700",    bg: "bg-red-100" },
};
const STATUSES = Object.keys(STATUS_CONFIG) as BookingStatus[];

export function AdminBookingsTab() {
  const {
    allBookings,
    adminAcceptBooking,
    adminRefuseBooking,
    adminMarkPaymentReceived,
    adminUpdateBookingStatus,
    adminDeleteBooking,
  } = useBooking();

  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [viewBooking, setViewBooking] = useState<BookingItem | null>(null);
  const [editStatus, setEditStatus] = useState<{ id: string; status: BookingStatus } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [validateTarget, setValidateTarget] = useState<BookingItem | null>(null);
  const [refuseTarget, setRefuseTarget] = useState<BookingItem | null>(null);
  const [refuseReason, setRefuseReason] = useState("manual");
  const [refuseNote, setRefuseNote] = useState("");
  const [payTarget, setPayTarget] = useState<BookingItem | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = allBookings.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = `${b.clientPrenom} ${b.clientNom} ${b.carName} ${b.id}`.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const openValidate = (b: BookingItem) => setValidateTarget(b);

  const handleValidate = () => {
    if (!validateTarget) return;
    // L'admin prend la décision finale — la validation est toujours possible
    adminAcceptBooking(validateTarget.id);
    setValidateTarget(null);
    showToast("Réservation validée ! Le client a été notifié.");
  };

  const handleRefuseFromValidate = () => {
    if (!validateTarget) return;
    const target = validateTarget;
    setValidateTarget(null);
    openRefuse(target);
  };

  const openRefuse = (b: BookingItem) => {
    const result = checkCanValidate(b, allBookings);
    const preReason = result.checks.find((c) => !c.ok)
      ? REFUSE_REASONS.find((r) => r.value !== "manual")?.value || "manual"
      : "manual";
    setRefuseTarget(b);
    setRefuseReason(preReason);
    setRefuseNote("");
  };

  const handleRefuse = () => {
    if (!refuseTarget) return;
    adminRefuseBooking(refuseTarget.id, refuseReason, refuseNote);
    setRefuseTarget(null);
    showToast("Réservation refusée. Le client a été notifié.", "error");
  };

  const handlePaymentReceived = () => {
    if (!payTarget) return;
    adminMarkPaymentReceived(payTarget.id);
    setPayTarget(null);
    showToast("Paiement cash confirmé !");
  };

  const handleStatusChange = () => {
    if (!editStatus) return;
    adminUpdateBookingStatus(editStatus.id, editStatus.status);
    setEditStatus(null);
    showToast("Statut mis à jour !");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    adminDeleteBooking(deleteId);
    setDeleteId(null);
    showToast("Réservation supprimée.");
  };

  const totalRevenue = allBookings.filter((b) => b.status !== "cancelled" && b.status !== "refused").reduce((s, b) => s + b.totalPrice, 0);
  const paidRevenue = allBookings.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 text-white text-sm px-5 py-3 rounded-2xl font-medium ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", val: allBookings.length, color: "text-gray-700", bg: "bg-white" },
          { label: "En attente", val: allBookings.filter((b) => b.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Confirmées", val: allBookings.filter((b) => b.status === "confirmed").length, color: "text-green-700", bg: "bg-green-50" },
          { label: "En cours", val: allBookings.filter((b) => b.status === "active").length, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Revenus attendus", val: `${totalRevenue.toLocaleString()} MAD`, color: "text-green-700", bg: "bg-green-50" },
          { label: "Cash encaissé", val: `${paidRevenue.toLocaleString()} MAD`, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <div className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
          <i className="ri-hand-coin-line text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Paiement Cash à la Livraison</p>
          <p className="text-xs text-amber-700 mt-0.5">Le client règle en espèces lors de la remise du véhicule. Confirmez la réception via le bouton <strong>Cash</strong>.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-gray-400 text-sm" />
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, voiture, ID..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 w-52" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", ...STATUSES] as (BookingStatus | "all")[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${filter === s ? "bg-green-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"}`}>
              {s === "all" ? "Toutes" : STATUS_CONFIG[s as BookingStatus].label}
              {s !== "all" && <span className="ml-1 opacity-70">({allBookings.filter((b) => b.status === s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} réservation(s)</p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {["ID", "Client", "Voiture", "Période", "Villes", "Total", "Paiement", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => {
                const s = STATUS_CONFIG[b.status];
                const isPending = b.status === "pending";
                const isConfirmedOrActive = b.status === "confirmed" || b.status === "active";
                const validation = isPending ? checkCanValidate(b, allBookings) : null;
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-500 font-semibold">{b.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap">{b.clientPrenom} {b.clientNom}</p>
                        <p className="text-gray-400">{b.clientEmail}</p>
                        {b.clientStatus === "suspended" && <span className="text-red-500 font-semibold">Suspendu</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.carName}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{b.startDate} {b.startTime}<br />{b.endDate} {b.endTime}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{b.villeDepart}<br />{b.villeRetour}</td>
                    <td className="px-4 py-3 font-bold text-green-700 whitespace-nowrap">{b.totalPrice.toLocaleString()} MAD</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${b.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`}>
                        <i className="ri-hand-coin-line" />{b.paymentStatus === "paid" ? "Encaissé" : "En attente"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${s.bg} ${s.color}`}>{s.label}</span>
                        {isPending && validation && !validation.canValidate && (
                          <p className="text-red-400 text-xs mt-0.5">{validation.checks.filter((c) => !c.ok).length} blocage(s)</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {isPending && (
                          <>
                            <button onClick={() => openValidate(b)} title="Valider"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap bg-green-50 text-green-700 hover:bg-green-100">
                              <div className="w-3.5 h-3.5 flex items-center justify-center">
                                <i className={`text-xs ${validation && !validation.canValidate ? "ri-alert-line text-amber-500" : "ri-check-line"}`} />
                              </div>
                              Valider
                            </button>
                            <button onClick={() => openRefuse(b)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer whitespace-nowrap text-xs font-semibold">
                              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-close-line text-xs" /></div>
                              Refuser
                            </button>
                          </>
                        )}
                        {isConfirmedOrActive && b.paymentStatus !== "paid" && (
                          <button onClick={() => setPayTarget(b)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer whitespace-nowrap text-xs font-semibold">
                            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-hand-coin-line text-xs" /></div>
                            Cash
                          </button>
                        )}
                        <button onClick={() => setViewBooking(b)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 cursor-pointer" title="Détail">
                          <i className="ri-eye-line text-sm" />
                        </button>
                        <button onClick={() => setEditStatus({ id: b.id, status: b.status })} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-yellow-50 text-yellow-600 cursor-pointer" title="Changer statut">
                          <i className="ri-refresh-line text-sm" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 cursor-pointer" title="Supprimer">
                          <i className="ri-delete-bin-line text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune réservation trouvée</div>}
        </div>
      </div>

      {/* ═══ VALIDATE MODAL ══════════════════════════════════════════════════ */}
      {validateTarget && (() => {
        const result = checkCanValidate(validateTarget, allBookings);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
            <div className="bg-white rounded-3xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-800">Valider la réservation</h3>
                <button onClick={() => setValidateTarget(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                  <i className="ri-close-line text-gray-500 text-lg" />
                </button>
              </div>

              {/* Client info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2 text-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Informations Client</p>
                {[
                  { l: "Conducteur", v: `${validateTarget.clientPrenom} ${validateTarget.clientNom}` },
                  { l: "Email", v: validateTarget.clientEmail },
                  { l: "Téléphone", v: validateTarget.clientPhone },
                  { l: "CIN", v: validateTarget.clientCIN },
                  { l: "N° Permis", v: validateTarget.clientNumPermis },
                  { l: "Expiration permis", v: validateTarget.clientDateExpirationPermis },
                  { l: "Voiture", v: validateTarget.carName },
                  { l: "Période", v: `${validateTarget.startDate} ${validateTarget.startTime} → ${validateTarget.endDate} ${validateTarget.endTime}` },
                  { l: "Villes", v: `${validateTarget.villeDepart} → ${validateTarget.villeRetour}` },
                  { l: "Montant", v: `${validateTarget.totalPrice.toLocaleString()} MAD` },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between text-xs py-1 border-b border-gray-100">
                    <span className="text-gray-500">{row.l}</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[60%]">{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Conditions */}
              <p className="text-xs font-semibold text-gray-600 mb-2">Vérification des conditions :</p>
              <div className="space-y-2 mb-4">
                {result.checks.map((c) => (
                  <div key={c.label} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${c.ok ? "bg-green-50" : "bg-red-50"}`}>
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${c.ok ? "bg-green-500" : "bg-red-500"}`}>
                      <i className={`text-white ${c.ok ? "ri-check-line" : "ri-close-line"}`} style={{ fontSize: "10px" }} />
                    </div>
                    <span className={c.ok ? "text-green-800" : "text-red-700 font-semibold"}>{c.label}</span>
                    {!c.ok && <span className="ml-auto text-xs text-red-500 font-bold whitespace-nowrap">Bloquant</span>}
                  </div>
                ))}
              </div>

              {result.canValidate ? (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs px-4 py-3 rounded-2xl mb-4 font-semibold">
                  <i className="ri-checkbox-circle-fill text-green-500" /> Toutes les conditions sont remplies.
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs px-4 py-3 rounded-2xl mb-4">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className="ri-alert-fill text-amber-500" />
                  </div>
                  <span><strong>{result.checks.filter((c) => !c.ok).length} condition(s)</strong> à vérifier. Vous pouvez tout de même valider ou refuser.</span>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setValidateTarget(null)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                  Annuler
                </button>
                <button onClick={handleRefuseFromValidate}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
                  <span className="flex items-center justify-center gap-1">
                    <i className="ri-close-line" /> Refuser
                  </span>
                </button>
                <button onClick={handleValidate}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors">
                  <span className="flex items-center justify-center gap-1">
                    <i className="ri-check-line" /> Valider
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ REFUSE MODAL ════════════════════════════════════════════════════ */}
      {refuseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">Refuser la réservation</h3>
              <button onClick={() => setRefuseTarget(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>
            <div className="bg-red-50 rounded-2xl p-3 mb-4 text-sm text-red-700">
              <strong>{refuseTarget.id}</strong> — {refuseTarget.clientPrenom} {refuseTarget.clientNom} / {refuseTarget.carName}
            </div>

            <p className="text-xs font-semibold text-gray-600 mb-2">Motif de refus :</p>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {REFUSE_REASONS.map((opt) => (
                <button key={opt.value} onClick={() => setRefuseReason(opt.value)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all cursor-pointer text-left ${refuseReason === opt.value ? "border-red-400 bg-red-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${refuseReason === opt.value ? "border-red-500 bg-red-500" : "border-gray-300"}`}>
                    {refuseReason === opt.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className={`font-medium ${refuseReason === opt.value ? "text-red-700" : "text-gray-600"}`}>{opt.label}</p>
                    {refuseReason === opt.value && (
                      <p className="text-xs text-green-700 mt-1"><span className="font-bold">Solution : </span>{opt.solution}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {refuseReason === "manual" && (
              <textarea value={refuseNote} onChange={(e) => setRefuseNote(e.target.value)} placeholder="Précisez la raison..."
                maxLength={500} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-red-300 mb-4" />
            )}

            <div className="flex gap-3">
              <button onClick={() => setRefuseTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                Annuler
              </button>
              <button onClick={handleRefuse} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 cursor-pointer whitespace-nowrap">
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYMENT MODAL ═══════════════════════════════════════════════════ */}
      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-amber-100 rounded-2xl mx-auto mb-4">
              <i className="ri-hand-coin-fill text-amber-600 text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Confirmer le paiement cash</h3>
            <p className="text-sm text-gray-500 mb-4">{payTarget.id} — {payTarget.clientPrenom} {payTarget.clientNom}</p>
            <div className="bg-amber-50 rounded-2xl p-4 mb-5">
              <p className="text-xs text-amber-700 mb-1">Montant à encaisser :</p>
              <p className="text-2xl font-bold text-amber-800">{payTarget.totalPrice.toLocaleString()} MAD</p>
              <p className="text-xs text-amber-600 mt-1">À percevoir lors de la remise du véhicule</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPayTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">Annuler</button>
              <button onClick={handlePaymentReceived} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 cursor-pointer whitespace-nowrap">Cash reçu</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEW DETAIL ════════════════════════════════════════════════════ */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">Dossier complet — {viewBooking.id}</h3>
              <button onClick={() => setViewBooking(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Client section */}
              <div className="p-3 bg-sky-50 rounded-xl">
                <p className="text-xs font-bold text-sky-700 mb-2 flex items-center gap-1"><i className="ri-user-line" /> Client</p>
                {[
                  { l: "Nom complet", v: `${viewBooking.clientPrenom} ${viewBooking.clientNom}` },
                  { l: "Email", v: viewBooking.clientEmail },
                  { l: "Téléphone", v: viewBooking.clientPhone },
                  { l: "CIN", v: viewBooking.clientCIN },
                  { l: "N° Permis", v: viewBooking.clientNumPermis },
                  { l: "Exp. Permis", v: viewBooking.clientDateExpirationPermis },
                  { l: "Statut client", v: viewBooking.clientStatus === "active" ? "Actif" : "Suspendu" },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between text-xs py-1 border-b border-sky-100">
                    <span className="text-sky-500">{row.l}</span>
                    <span className={`font-semibold ${row.v === "Suspendu" ? "text-red-600" : "text-sky-900"}`}>{row.v}</span>
                  </div>
                ))}
              </div>
              {/* Booking section */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1"><i className="ri-calendar-line text-green-500" /> Réservation</p>
                {[
                  { l: "Voiture", v: viewBooking.carName },
                  { l: "Départ", v: `${viewBooking.startDate} à ${viewBooking.startTime}` },
                  { l: "Retour", v: `${viewBooking.endDate} à ${viewBooking.endTime}` },
                  { l: "Durée", v: `${daysCount(viewBooking.startDate, viewBooking.endDate)} jour(s)` },
                  { l: "Ville départ", v: viewBooking.villeDepart },
                  { l: "Ville retour", v: viewBooking.villeRetour },
                  { l: "Montant", v: `${viewBooking.totalPrice.toLocaleString()} MAD` },
                  { l: "Paiement", v: viewBooking.paymentStatus === "paid" ? "Encaissé" : "En attente" },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between text-xs py-1 border-b border-gray-100">
                    <span className="text-gray-500">{row.l}</span>
                    <span className="font-semibold text-gray-800">{row.v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-1">
                  <span className="text-gray-500">Statut</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[viewBooking.status].bg} ${STATUS_CONFIG[viewBooking.status].color}`}>
                    {STATUS_CONFIG[viewBooking.status].label}
                  </span>
                </div>
              </div>
              {viewBooking.refuseReason && (
                <div className="bg-red-50 rounded-xl px-3 py-2 text-xs text-red-700">
                  <p className="font-bold mb-1">Motif de refus : {viewBooking.refuseReason}</p>
                  {viewBooking.refuseSolution && <p className="text-green-700"><span className="font-bold">Solution : </span>{viewBooking.refuseSolution}</p>}
                </div>
              )}
            </div>
            {viewBooking.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => { openValidate(viewBooking); setViewBooking(null); }} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">Valider</button>
                <button onClick={() => { openRefuse(viewBooking); setViewBooking(null); }} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 cursor-pointer whitespace-nowrap">Refuser</button>
              </div>
            )}
            <button onClick={() => setViewBooking(null)} className="mt-3 w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap">Fermer</button>
          </div>
        </div>
      )}

      {/* ═══ EDIT STATUS ═════════════════════════════════════════════════════ */}
      {editStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Changer le statut</h3>
              <button onClick={() => setEditStatus(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-gray-500" /></button>
            </div>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setEditStatus({ ...editStatus, status: s })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium cursor-pointer ${editStatus.status === s ? "border-green-400 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`}>{STATUS_CONFIG[s].label}</span>
                  {editStatus.status === s && <div className="ml-auto w-4 h-4 flex items-center justify-center"><i className="ri-checkbox-circle-fill text-green-500" /></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditStatus(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap">Annuler</button>
              <button onClick={handleStatusChange} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE ══════════════════════════════════════════════════════════ */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-2xl mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Supprimer ?</h3>
            <p className="text-sm text-gray-500 mb-5">La réservation <strong>{deleteId}</strong> sera définitivement supprimée.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap">Annuler</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 cursor-pointer whitespace-nowrap">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
