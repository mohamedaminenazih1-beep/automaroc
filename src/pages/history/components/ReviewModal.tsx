import { useState } from "react";
import type { BookingItem } from "@/mocks/bookings";

interface Props {
  booking: BookingItem;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export function ReviewModal({ booking, onSubmit, onClose }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit(rating, comment);
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-6">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-3">
              <i className="ri-checkbox-circle-fill text-green-500 text-3xl" />
            </div>
            <h4 className="text-base font-bold text-gray-800 mb-1">Merci pour votre avis !</h4>
            <p className="text-sm text-gray-500">Votre avis a été publié avec succès.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">Laisser un avis</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
              <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                <img src={booking.carImage} alt={booking.carName} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{booking.carName}</p>
                <p className="text-xs text-gray-500">{booking.startDate} → {booking.endDate}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-3">Note globale</p>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map((s) => (
                    <button type="button" key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(s)}
                      className="w-10 h-10 flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
                      <i className={`ri-star-fill text-2xl ${(hovered || rating) >= s ? "text-yellow-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{["", "Mauvais", "Passable", "Correct", "Bien", "Excellent"][hovered || rating]}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Votre commentaire <span className="text-red-400">*</span></label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience avec ce véhicule et notre service..."
                  maxLength={500} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50" />
                <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={!comment.trim()}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap disabled:opacity-50">
                  Publier l&apos;avis
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
