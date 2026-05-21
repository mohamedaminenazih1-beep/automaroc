import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

const ALL_CATEGORIES = ["Toutes", "Économique", "Berline", "SUV", "Utilitaire"];

interface CarsGridProps {
  search: string;
  selectedCity: string;
  selectedCat: string;
  setSelectedCat: (cat: string) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="w-3 h-3 flex items-center justify-center">
          <i className={`${s <= Math.round(rating) ? "ri-star-fill text-yellow-400" : "ri-star-line text-gray-300"} text-xs`} />
        </div>
      ))}
    </div>
  );
}

export function CarsGrid({ search, selectedCity, selectedCat, setSelectedCat }: CarsGridProps) {
  const navigate = useNavigate();
  const { cart, addToCart } = useBooking();
  const { isAuthenticated, role } = useAuth();
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [cars, setCars] = useState<any[]>([]);

  useEffect(() => {
    api.cars.getAll().then(setCars).catch(console.error);
  }, []);

  const filtered = cars.filter((car) => {
    const matchCity = selectedCity === "Toutes les villes" || car.city === selectedCity;
    const matchCat = selectedCat === "Toutes" || car.category === selectedCat;
    const matchSearch =
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchCat && matchSearch;
  });

  const handleQuickCart = (car: any) => {
    if (!isAuthenticated || role === "guest") {
      navigate("/login");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    addToCart({
      carId: car.id,
      carName: car.name,
      carBrand: car.brand,
      carImage: car.image,
      pricePerDay: car.pricePerDay,
      startDate: today,
      startTime: "09:00",
      endDate: tomorrow,
      endTime: "18:00",
      villeDepart: car.city,
      villeRetour: car.city,
      days: 1,
      totalPrice: car.pricePerDay,
      city: car.city,
    });
    setAddedToCartId(car.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  return (
    <section id="cars-section" className="py-10 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCat === cat
                  ? "bg-green-500 text-white"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500">
            <span className="font-semibold text-green-700">{filtered.length}</span> voiture(s)
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
              <i className="ri-car-line text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-500 text-sm">Aucune voiture trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5" data-product-shop>
            {filtered.map((car) => {
              const inCart = cart.some((c) => c.carId === car.id);
              const justAdded = addedToCartId === car.id;
              return (
                <div
                  key={car.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-200 transition-all duration-200 group"
                >
                  {/* Image — click to detail */}
                  <div
                    className="relative w-full h-44 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/car/${car.id}`)}
                  >
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${car.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {car.available ? "Disponible" : "Loué"}
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-600">
                      {car.category}
                    </div>
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        Voir détails
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">{car.name}</h3>
                        <p className="text-xs text-gray-400">{car.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-green-600">{car.pricePerDay} MAD</p>
                        <p className="text-xs text-gray-400">/jour</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <StarRating rating={car.rating} />
                      <span className="text-xs text-gray-400 ml-1">{car.rating}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
                      <span className="flex items-center gap-1"><i className="ri-user-line text-xs" />{car.seats} places</span>
                      <span className="flex items-center gap-1"><i className="ri-settings-3-line text-xs" />{car.transmission}</span>
                      <span className="flex items-center gap-1"><i className="ri-gas-station-line text-xs" />{car.fuel}</span>
                      <span className="flex items-center gap-1"><i className="ri-map-pin-line text-xs" />{car.city}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {/* Cart button */}
                      <button
                        onClick={() => handleQuickCart(car)}
                        disabled={!car.available || inCart}
                        title={inCart ? "Déjà dans le panier" : "Ajouter au panier"}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all flex-shrink-0 ${
                          inCart
                            ? "border-green-300 bg-green-50 text-green-600 cursor-default"
                            : car.available
                            ? "border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-500 hover:text-green-600 cursor-pointer"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <i className={`${inCart || justAdded ? "ri-shopping-cart-fill" : "ri-shopping-cart-line"} text-sm`} />
                      </button>

                      {/* Always go to detail page first */}
                      <button
                        onClick={() => navigate(`/car/${car.id}`)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                          car.available
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {car.available ? "Voir & Réserver" : "Voir détails"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </section>
  );
}
