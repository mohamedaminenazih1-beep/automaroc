import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cart, removeFromCart, submitBooking, unreadCount } = useBooking();

  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (!isAuthenticated || !user) {
    navigate("/");
    return null;
  }

  const handleConfirmAll = () => {
    cart.forEach((item) => {
      submitBooking(item, {
        userId: user.id,
        clientNom: user.nom,
        clientPrenom: user.prenom,
        clientEmail: user.email,
        clientPhone: user.phone,
        clientCIN: user.cin,
        clientNumPermis: user.numPermis,
        clientDateExpirationPermis: user.dateExpirationPermis,
        clientStatus: user.status,
      });
    });
    setConfirmedId("all");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7fdf7" }}>
      {/* Navbar */}
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
            <Link to="/history" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-history-line text-gray-600" />
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
          <i className="ri-shopping-cart-2-line text-green-500" />
          Mon panier
          {cart.length > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-400">({cart.length} voiture{cart.length > 1 ? "s" : ""})</span>
          )}
        </h1>

        {confirmedId === "all" ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-5 bg-green-100 rounded-full">
              <i className="ri-checkbox-circle-fill text-green-500 text-5xl" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Demandes envoyées avec succès !</h2>
            <p className="text-sm text-gray-500 mb-6">Vos demandes sont en attente de validation. Vous serez notifié dès qu&apos;une décision sera prise.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/history")} className="px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
                Voir mes réservations
              </button>
              <button onClick={() => navigate("/catalogue")} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">
                Continuer la navigation
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-5 bg-gray-100 rounded-full">
              <i className="ri-shopping-cart-line text-gray-400 text-4xl" />
            </div>
            <h2 className="text-base font-bold text-gray-700 mb-2">Votre panier est vide</h2>
            <p className="text-sm text-gray-400 mb-6">Explorez notre catalogue et ajoutez des voitures à votre panier.</p>
            <button onClick={() => navigate("/catalogue")} className="px-8 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
              Voir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.carId} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4">
                  <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.carImage} alt={item.carName} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">{item.carName}</h3>
                        <p className="text-xs text-gray-400">{item.carBrand} • {item.city}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.carId)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><i className="ri-calendar-line" />{item.startDate} {item.startTime}</span>
                      <i className="ri-arrow-right-line text-gray-300" />
                      <span>{item.endDate} {item.endTime}</span>
                      <span className="bg-gray-50 px-2 py-0.5 rounded-full">{item.days}j</span>
                    </div>
                    {(item.villeDepart || item.villeRetour) && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <i className="ri-map-pin-line text-xs" />
                        {item.villeDepart} → {item.villeRetour}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{item.pricePerDay} MAD/jour</span>
                      <span className="text-sm font-bold text-green-600">{item.totalPrice.toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Récapitulatif</h3>
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.carId} className="flex justify-between text-xs text-gray-600">
                      <span className="truncate mr-2">{item.carName}</span>
                      <span className="font-medium whitespace-nowrap">{item.totalPrice.toLocaleString()} MAD</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-green-600">{total.toLocaleString()} MAD</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl mb-3 text-xs text-amber-700">
                  <i className="ri-hand-coin-line" />
                  Paiement cash à la livraison
                </div>
                <button
                  onClick={handleConfirmAll}
                  className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-send-plane-line mr-1" />
                  Envoyer les demandes ({cart.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
