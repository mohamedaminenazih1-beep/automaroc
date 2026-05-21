import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";

const MOROCCAN_CITIES = [
  "Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès",
  "Oujda","Kénitra","Tétouan","Safi","Mohammedia","El Jadida","Beni Mellal",
  "Nador","Settat","Larache","Khouribga","Laâyoune","Dakhla",
];

interface Car {
  id: string;
  name: string;
  brand: string;
  image: string;
  pricePerDay: number;
  city: string;
}

interface BookingModalProps {
  car: Car;
  onClose: () => void;
}

type Step = "form" | "summary" | "sent";

export function BookingModal({ car, onClose }: BookingModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { submitBooking, addToCart } = useBooking();

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [villeDepart, setVilleDepart] = useState(car.city || "Casablanca");
  const [villeRetour, setVilleRetour] = useState(car.city || "Casablanca");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");

  const isLoggedIn = isAuthenticated && role === "client";

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const total = days * car.pricePerDay;

  const validate = () => {
    if (!startDate || !endDate) return "Veuillez choisir les dates de réservation.";
    if (new Date(endDate) <= new Date(startDate)) return "La date de retour doit être postérieure à la date de départ.";
    if (!villeDepart) return "Veuillez sélectionner une ville de départ.";
    if (!villeRetour) return "Veuillez sélectionner une ville de retour.";
    return "";
  };

  const handleNext = () => {
    setError("");
    if (!isLoggedIn) return;
    const err = validate();
    if (err) { setError(err); return; }
    setStep("summary");
  };

  const handleAddToCart = () => {
    setError("");
    if (!isLoggedIn) { setError("Vous devez être connecté pour ajouter au panier."); return; }
    const err = validate();
    if (err) { setError(err); return; }
    addToCart({
      carId: car.id, carName: car.name, carBrand: car.brand, carImage: car.image,
      pricePerDay: car.pricePerDay, startDate, startTime, endDate, endTime,
      villeDepart, villeRetour, days, totalPrice: total, city: car.city,
    });
    onClose();
  };

  const handleConfirm = () => {
    if (!user) return;
    submitBooking(
      {
        carId: car.id, carName: car.name, carBrand: car.brand, carImage: car.image,
        pricePerDay: car.pricePerDay, startDate, startTime, endDate, endTime,
        villeDepart, villeRetour, days, totalPrice: total, city: car.city,
      },
      {
        userId: user.id,
        clientNom: user.nom,
        clientPrenom: user.prenom,
        clientEmail: user.email,
        clientPhone: user.phone,
        clientCIN: user.cin,
        clientNumPermis: user.numPermis,
        clientDateExpirationPermis: user.dateExpirationPermis,
        clientStatus: user.status,
      }
    );
    setStep("sent");
  };

  const SelectField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 cursor-pointer appearance-none bg-white">
        <option value="">Sélectionner ville</option>
        {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center">
        <i className="ri-arrow-down-s-line text-gray-400 text-sm" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-gray-800">
            {step === "sent" ? "Demande envoyée !" : step === "summary" ? "Récapitulatif" : "Réserver ce véhicule"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-gray-500 text-lg" />
          </button>
        </div>

        <div className="p-6">
          {/* Car info */}
          <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-2xl">
            <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <img src={car.image} alt={car.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{car.name}</p>
              <p className="text-xs text-gray-500">{car.brand} • {car.city}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-green-600">{car.pricePerDay} MAD</p>
              <p className="text-xs text-gray-400">/jour</p>
            </div>
          </div>

          {/* ── NOT LOGGED IN ── */}
          {!isLoggedIn && (
            <div className="text-center py-4">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-amber-50 rounded-full">
                <i className="ri-lock-line text-amber-500 text-3xl" />
              </div>
              <h4 className="text-base font-bold text-gray-800 mb-2">Compte requis pour réserver</h4>
              <p className="text-sm text-gray-500 mb-6">Pour réserver ce véhicule, vous devez être connecté à votre compte AutoMaroc.</p>
              <div className="flex gap-3">
                <button onClick={() => { onClose(); navigate("/signup"); }}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
                  <i className="ri-user-add-line mr-1" /> Créer un compte
                </button>
                <button onClick={() => { onClose(); navigate("/"); }}
                  className="flex-1 py-3 border border-green-300 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 cursor-pointer whitespace-nowrap">
                  <i className="ri-login-circle-line mr-1" /> Se connecter
                </button>
              </div>
            </div>
          )}

          {/* ── BOOKING FORM ── */}
          {isLoggedIn && step === "form" && (
            <>
              {/* Dates */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date de départ</label>
                    <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Heure de départ</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 cursor-pointer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date de retour</label>
                    <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Heure de retour</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 cursor-pointer" />
                  </div>
                </div>

                {/* Villes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ville de départ</label>
                    <SelectField label="Ville départ" value={villeDepart} onChange={setVilleDepart} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ville de retour</label>
                    <SelectField label="Ville retour" value={villeRetour} onChange={setVilleRetour} />
                  </div>
                </div>

                {/* Price summary */}
                {days > 0 && (
                  <div className="p-3 bg-green-50 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-green-700">{days} jour{days > 1 ? "s" : ""} × {car.pricePerDay} MAD</span>
                    <span className="text-sm font-bold text-green-700">{total.toLocaleString()} MAD</span>
                  </div>
                )}

                {/* Driver info (pre-filled) */}
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                  <p className="text-xs font-bold text-sky-700 mb-3 flex items-center gap-1.5">
                    <i className="ri-user-line" /> Informations conducteur (depuis votre profil)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-sky-900">
                    <div>
                      <span className="text-sky-500 block">Nom complet</span>
                      <span className="font-semibold">{user?.prenom} {user?.nom}</span>
                    </div>
                    <div>
                      <span className="text-sky-500 block">Téléphone</span>
                      <span className="font-semibold">{user?.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="text-sky-500 block">CIN</span>
                      <span className="font-semibold">{user?.cin || "—"}</span>
                    </div>
                    <div>
                      <span className="text-sky-500 block">N° Permis</span>
                      <span className="font-semibold">{user?.numPermis || "—"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sky-500 block">Expiration permis</span>
                      <span className="font-semibold">{user?.dateExpirationPermis || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <i className="ri-hand-coin-line text-amber-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Paiement Cash à la Livraison</p>
                    <p className="text-xs text-amber-700">Le montant est réglé en espèces lors de la remise du véhicule</p>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <i className="ri-error-warning-line" />{error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button onClick={handleAddToCart}
                    className="flex-1 py-3 border border-green-300 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-shopping-cart-line mr-1" />Panier
                  </button>
                  <button onClick={handleNext}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap">
                    Réserver
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── SUMMARY ── */}
          {isLoggedIn && step === "summary" && (
            <>
              <div className="space-y-2.5">
                {[
                  { label: "Départ", value: `${startDate} à ${startTime}` },
                  { label: "Retour", value: `${endDate} à ${endTime}` },
                  { label: "Durée", value: `${days} jour${days > 1 ? "s" : ""}` },
                  { label: "Ville départ", value: villeDepart },
                  { label: "Ville retour", value: villeRetour },
                  { label: "Conducteur", value: `${user?.prenom} ${user?.nom}` },
                  { label: "CIN", value: user?.cin || "—" },
                  { label: "N° Permis", value: user?.numPermis || "—" },
                  { label: "Prix/jour", value: `${car.pricePerDay} MAD` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-800">Total estimé</span>
                  <span className="text-lg font-bold text-green-600">{total.toLocaleString()} MAD</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                  <i className="ri-hand-coin-line" />
                  Paiement cash à la remise du véhicule
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl text-xs text-yellow-700">
                  <i className="ri-time-line" />
                  Votre demande sera examinée par notre équipe. Vous serez notifié de la décision.
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setStep("form")}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  Modifier
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap">
                  Envoyer la demande
                </button>
              </div>
            </>
          )}

          {/* ── SENT ── */}
          {step === "sent" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-yellow-50 rounded-full">
                <i className="ri-time-line text-yellow-500 text-4xl" />
              </div>
              <h4 className="text-base font-bold text-gray-800 mb-2">Demande envoyée !</h4>
              <p className="text-sm text-gray-500 mb-2">
                Votre demande pour la <strong>{car.name}</strong> est en attente de validation.
              </p>
              <p className="text-xs text-gray-400 mb-5">
                Notre équipe examinera votre dossier et vous enverra une notification dès qu&apos;une décision sera prise.
              </p>
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  Fermer
                </button>
                <button onClick={() => { onClose(); navigate("/history"); }}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
                  Mes réservations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
