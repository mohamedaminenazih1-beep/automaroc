import type { BookingItem } from "@/mocks/bookings";

interface Props {
  booking: BookingItem;
  onClose: () => void;
}

export function BookingVoucher({ booking, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 bg-green-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-file-text-line text-white text-base" />
            </div>
            <h3 className="text-sm font-bold text-white">Bon de Réservation</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-600 cursor-pointer">
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        <div className="p-6">
          {/* Logo + Agency */}
          <div className="text-center mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png" alt="AutoMaroc" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-green-700">AutoMaroc</span>
            </div>
            <p className="text-xs text-gray-400">Agence de Location de Voitures — Maroc</p>
            <div className="mt-2 px-3 py-1 bg-green-50 rounded-full inline-block">
              <span className="text-xs font-bold text-green-700">BON N° {booking.id}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3 mb-5">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-700">Réservation Confirmée</p>
              <p className="text-xs text-green-600">Validée par AutoMaroc le {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Véhicule</p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img src={booking.carImage} alt={booking.carName} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{booking.carName}</p>
                <p className="text-xs text-gray-500">{booking.carBrand}</p>
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Détails de la Location</p>
            <div className="space-y-2">
              {[
                { icon: "ri-calendar-line", label: "Départ", value: `${booking.startDate} à ${booking.startTime}` },
                { icon: "ri-calendar-check-line", label: "Retour prévu", value: `${booking.endDate} à ${booking.endTime}` },
                { icon: "ri-time-line", label: "Durée", value: `${booking.days} jour${booking.days > 1 ? "s" : ""}` },
                { icon: "ri-map-pin-2-line", label: "Départ de", value: booking.villeDepart },
                { icon: "ri-map-pin-line", label: "Retour à", value: booking.villeRetour },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <i className={`${row.icon} text-green-500 text-sm`} />
                    {row.label}
                  </span>
                  <span className="text-xs font-semibold text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client info */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Informations Conducteur</p>
            <div className="space-y-1.5">
              {[
                { label: "Conducteur", value: `${booking.clientPrenom} ${booking.clientNom}` },
                { label: "Email", value: booking.clientEmail },
                { label: "Téléphone", value: booking.clientPhone },
                { label: "CIN", value: booking.clientCIN },
                { label: "N° Permis", value: booking.clientNumPermis },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="p-4 bg-amber-50 rounded-xl mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800">Mode de paiement</span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <i className="ri-hand-coin-line" /> Cash à la livraison
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-800">Montant total</span>
              <span className="text-xl font-bold text-amber-800">{booking.totalPrice.toLocaleString()} MAD</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">À régler en espèces lors de la remise du véhicule</p>
          </div>

          {/* Footer note */}
          <div className="text-center p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
            <p>Présentez ce bon lors de la prise du véhicule.</p>
            <p className="mt-0.5">Pour toute question : <span className="font-semibold text-green-700">contact@automaroc.ma</span></p>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handlePrint}
              className="flex-1 py-2.5 border border-green-300 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 cursor-pointer whitespace-nowrap">
              <i className="ri-printer-line mr-1" /> Imprimer
            </button>
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
