import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import type { BookingItem } from "@/mocks/bookings";
import { BookingVoucher } from "./components/BookingVoucher";
import { ReviewModal } from "./components/ReviewModal";

const statusConfig: Record<BookingItem["status"], { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: "En attente de validation", color: "text-yellow-700", bg: "bg-yellow-50",  icon: "ri-time-line" },
  confirmed: { label: "Confirmée",                color: "text-green-700",  bg: "bg-green-50",   icon: "ri-checkbox-circle-line" },
  active:    { label: "En cours",                 color: "text-orange-700", bg: "bg-orange-50",  icon: "ri-steering-2-line" },
  completed: { label: "Terminée",                 color: "text-gray-600",   bg: "bg-gray-100",   icon: "ri-flag-line" },
  cancelled: { label: "Annulée",                  color: "text-red-600",    bg: "bg-red-50",     icon: "ri-close-circle-line" },
  refused:   { label: "Refusée",                  color: "text-red-700",    bg: "bg-red-100",    icon: "ri-forbid-line" },
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { userBookings, cancelBooking, unreadCount, cart, submitReview } = useBooking();
  const [filter, setFilter] = useState<"all" | BookingItem["status"]>("all");
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<BookingItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<BookingItem | null>(null);

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const bookings = user ? userBookings(user.id) : [];
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const handleCancel = (id: string) => {
    cancelBooking(id);
    setCancelConfirm(null);
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    if (!reviewTarget || !user) return;
    submitReview({
      bookingId: reviewTarget.id,
      userId: user.id,
      userName: `${user.prenom} ${user.nom.charAt(0)}.`,
      carId: reviewTarget.carId,
      rating,
      comment,
    });
    setReviewTarget(null);
  };

  const tabFilters: { value: "all" | BookingItem["status"]; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "pending", label: "En attente" },
    { value: "confirmed", label: "Confirmées" },
    { value: "active", label: "En cours" },
    { value: "completed", label: "Terminées" },
    { value: "cancelled", label: "Annulées" },
    { value: "refused", label: "Refusées" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7fdf7" }}>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/catalogue")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
              <i className="ri-arrow-left-line text-gray-600" />
            </button>
            <Link to="/catalogue" className="flex items-center gap-2">
              <img src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png" alt="AutoMaroc" className="w-6 h-6 object-contain" />
              <span className="text-sm font-bold text-green-700">AutoMaroc</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-shopping-cart-line text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cart.length}</span>
              )}
            </Link>
            <Link to="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-notification-3-line text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className="ri-history-line text-green-500" />
          Mes Réservations
          <span className="text-sm font-normal text-gray-400">({bookings.length})</span>
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
          {tabFilters.map((tab) => {
            const count = tab.value === "all" ? bookings.length : bookings.filter((b) => b.status === tab.value).length;
            return (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filter === tab.value ? "bg-green-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"
                }`}>
                {tab.label}
                {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
              <i className="ri-file-list-3-line text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-500 text-sm mb-4">Aucune réservation trouvée</p>
            <button onClick={() => navigate("/catalogue")}
              className="px-6 py-2.5 bg-green-500 text-white rounded-full text-sm font-semibold hover:bg-green-600 cursor-pointer whitespace-nowrap">
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const s = statusConfig[booking.status];
              const canCancel = booking.status === "pending";
              const hasVoucher = booking.voucherGenerated && (booking.status === "confirmed" || booking.status === "active" || booking.status === "completed");
              const canReview = booking.status === "completed" && !booking.reviewLeft;

              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={booking.carImage} alt={booking.carName} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-gray-800">{booking.carName}</h3>
                            <p className="text-xs text-gray-400">{booking.carBrand} • {booking.villeDepart} → {booking.villeRetour}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${s.bg} ${s.color}`}>
                            <i className={`${s.icon} text-xs`} />
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <i className="ri-calendar-line" />{booking.startDate} {booking.startTime}
                          </span>
                          <i className="ri-arrow-right-line text-gray-300" />
                          <span>{booking.endDate} {booking.endTime}</span>
                          <span className="bg-gray-50 px-2 py-0.5 rounded-full font-medium">{booking.days} j</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Réf: {booking.id}</span>
                            <span className="flex items-center gap-0.5 text-xs text-amber-600">
                              <i className="ri-hand-coin-line text-xs" /> Cash
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-green-600">
                              {(booking.finalPrice ?? booking.totalPrice).toLocaleString()} MAD
                            </span>
                            {hasVoucher && (
                              <button onClick={() => setVoucher(booking)}
                                className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold hover:bg-green-100 cursor-pointer whitespace-nowrap flex items-center gap-1">
                                <i className="ri-file-text-line text-xs" /> Bon
                              </button>
                            )}
                            {canReview && (
                              <button onClick={() => setReviewTarget(booking)}
                                className="text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-semibold hover:bg-yellow-100 cursor-pointer whitespace-nowrap flex items-center gap-1">
                                <i className="ri-star-line text-xs" /> Avis
                              </button>
                            )}
                            {canCancel && (
                              <button onClick={() => setCancelConfirm(booking.id)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer whitespace-nowrap">
                                Annuler
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Refused reason */}
                    {booking.status === "refused" && booking.refuseReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1">
                          <i className="ri-error-warning-line" /> Motif de refus
                        </p>
                        <p className="text-xs text-red-600 mb-2">{booking.refuseReason}</p>
                        {booking.refuseSolution && (
                          <>
                            <p className="text-xs font-bold text-green-700 flex items-center gap-1 mb-1">
                              <i className="ri-lightbulb-line" /> Comment résoudre
                            </p>
                            <p className="text-xs text-green-700">{booking.refuseSolution}</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Return inspection summary */}
                    {booking.returnInspection && booking.status === "completed" && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                          <i className="ri-car-line text-green-500" /> Rapport de retour
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <span className="text-gray-500">Carburant</span><span className="font-semibold">{booking.returnInspection.fuelLevel}</span>
                          <span className="text-gray-500">État extérieur</span><span className="font-semibold">{booking.returnInspection.exteriorCondition}</span>
                          {booking.returnInspection.totalExtraFees > 0 && (
                            <>
                              <span className="text-red-500 font-semibold">Frais supplémentaires</span>
                              <span className="font-bold text-red-600">+{booking.returnInspection.totalExtraFees.toLocaleString()} MAD</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-800 mb-2">Annuler la réservation ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible. Votre demande sera annulée.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap hover:bg-gray-50">
                Garder
              </button>
              <button onClick={() => handleCancel(cancelConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-red-600">
                Confirmer l&apos;annulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher modal */}
      {voucher && <BookingVoucher booking={voucher} onClose={() => setVoucher(null)} />}

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal booking={reviewTarget} onSubmit={handleReviewSubmit} onClose={() => setReviewTarget(null)} />
      )}
    </div>
  );
}
