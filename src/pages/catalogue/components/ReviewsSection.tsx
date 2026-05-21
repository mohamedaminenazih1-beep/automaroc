import { mockReviews } from "@/mocks/reviews";
import { useBooking } from "@/contexts/BookingContext";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="w-3 h-3 flex items-center justify-center">
          <i className={`${s <= rating ? "ri-star-fill text-yellow-400" : "ri-star-line text-gray-300"} text-xs`} />
        </div>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const { reviews } = useBooking();

  // Combine context reviews (real) with static mock reviews, max 6 shown
  const contextReviews = reviews.slice(0, 6).map((r) => ({
    id: r.id,
    name: r.userName,
    city: "Maroc",
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    avatar: r.userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
    color: "bg-green-500",
  }));

  const combined = [...contextReviews, ...mockReviews].slice(0, 6);

  return (
    <section className="py-16 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-yellow-50 text-yellow-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-3">AVIS CLIENTS</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Ce que disent nos <span className="text-green-600">clients</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <StarRating rating={5} />
            <span className="text-sm font-bold text-gray-800">4.8/5</span>
            <span className="text-sm text-gray-400">— basé sur 1 200+ avis</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {combined.map((r) => (
            <div key={r.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${r.color} flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{r.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="ri-map-pin-line text-xs" />{r.city}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
              <StarRating rating={r.rating} />
              <p className="text-xs text-gray-600 leading-relaxed mt-3">&ldquo;{r.comment}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
