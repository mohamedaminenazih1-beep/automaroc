import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { api } from "@/services/api";
import { BookingModal } from "./components/BookingModal";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="w-4 h-4 flex items-center justify-center">
          <i className={`${s <= Math.round(rating) ? "ri-star-fill text-yellow-400" : "ri-star-line text-gray-300"} text-sm`} />
        </div>
      ))}
    </div>
  );
}

const carDetails: Record<string, { description: string; features: string[]; conditions: string[] }> = {
  "1": {
    description: "La Dacia Logan est la voiture idéale pour vos déplacements économiques au Maroc. Fiable, spacieuse et facile à conduire, elle offre un excellent rapport qualité-prix pour explorer les villes marocaines.",
    features: ["Climatisation", "Radio Bluetooth", "5 places", "Grand coffre", "Direction assistée", "Vitres électriques"],
    conditions: ["Permis B requis", "Caution : 2000 MAD", "Kilométrage illimité", "Assurance incluse", "Livraison possible"],
  },
  "2": {
    description: "La Renault Clio est un choix populaire pour les citadins. Compacte, agile et économique, elle se faufile parfaitement dans les médinas et les ruelles du Maroc.",
    features: ["Climatisation", "GPS intégré", "5 places", "Bluetooth", "Régulateur de vitesse", "Caméra de recul"],
    conditions: ["Permis B requis", "Caution : 2000 MAD", "Kilométrage illimité", "Assurance incluse", "Livraison possible"],
  },
  "3": {
    description: "Le Hyundai Tucson est le SUV parfait pour explorer les paysages marocains. Confortable, puissant et spacieux, il s'adapte à tous les terrains, des montagnes de l'Atlas aux routes côtières.",
    features: ["Climatisation bi-zone", "GPS", "5 places", "4x4", "Toit panoramique", "Siège chauffant", "Caméra 360°"],
    conditions: ["Permis B requis (2 ans min)", "Caution : 5000 MAD", "Kilométrage illimité", "Assurance tous risques", "Livraison aéroport"],
  },
  "4": {
    description: "La Toyota Corolla Hybride est le choix parfait pour ceux qui souhaitent allier confort, économie de carburant et respect de l'environnement lors de leurs déplacements au Maroc.",
    features: ["Hybride économique", "Climatisation auto", "5 places", "Apple CarPlay", "Régulateur adaptatif", "Alertes collision"],
    conditions: ["Permis B requis", "Caution : 4000 MAD", "Kilométrage illimité", "Assurance incluse", "Livraison possible"],
  },
  "5": {
    description: "La Peugeot 208 est une citadine moderne et stylée, parfaite pour les déplacements en ville. Son habitacle raffiné et ses équipements high-tech en font une voiture agréable à conduire.",
    features: ["Climatisation", "Écran tactile 7\"", "5 places", "Bluetooth", "Aide au stationnement", "Feux LED"],
    conditions: ["Permis B requis", "Caution : 2500 MAD", "Kilométrage illimité", "Assurance incluse", "Livraison possible"],
  },
  "6": {
    description: "Le Volkswagen Tiguan est un SUV premium qui combine élégance, puissance et technologie. Idéal pour les voyages d'affaires ou les escapades familiales à travers le Royaume du Maroc.",
    features: ["Climatisation tri-zone", "GPS Premium", "5 places", "4Motion", "Virtual Cockpit", "Toit ouvrant", "Massage siège"],
    conditions: ["Permis B requis (3 ans min)", "Caution : 6000 MAD", "Kilométrage illimité", "Assurance tous risques", "Livraison hôtel"],
  },
  "7": {
    description: "La Mercedes Classe C représente le summum du luxe et de la performance. Pour ceux qui ne font pas de compromis sur l'excellence, ce véhicule offre une expérience de conduite incomparable.",
    features: ["Climatisation 4 zones", "MBUX Navigation", "5 places", "Cuir Nappa", "Burmester Audio", "Airbag rideau", "Aide active"],
    conditions: ["Permis B requis (5 ans min)", "Caution : 10 000 MAD", "Kilométrage limité : 300km/j", "Assurance premium", "Chauffeur disponible"],
  },
  "8": {
    description: "Le Ford Transit est le véhicule utilitaire par excellence, parfait pour les groupes, les déménagements ou les livraisons. Sa grande capacité de charge en fait un outil incontournable.",
    features: ["Climatisation", "9 places ou cargo", "Grand volume", "Bluetooth", "Rétroviseurs chauffants", "Aide au démarrage en côte"],
    conditions: ["Permis B ou C requis", "Caution : 4000 MAD", "Kilométrage limité : 250km/j", "Assurance incluse", "Livraison possible"],
  },
};

const relatedReviews = [
  { name: "Mehdi Alaoui", city: "Casablanca", rating: 5, comment: "Voiture impeccable, service irréprochable. Je recommande vivement AutoMaroc !", date: "2026-04-10" },
  { name: "Fatima Zahra", city: "Marrakech", rating: 4, comment: "Très bonne expérience, la voiture était propre et en parfait état. Livraison rapide.", date: "2026-03-28" },
  { name: "Youssef Tazi", city: "Rabat", rating: 5, comment: "Personnel accueillant et professionnel. La voiture correspondait exactement à la description.", date: "2026-03-15" },
];

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart } = useBooking();
  const [showBooking, setShowBooking] = useState(false);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cars.getAll().then((data) => {
      setCars(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const car = cars.find((c) => c.id === id);
  const details = id ? carDetails[id] : null;
  const inCart = cart.some((c) => c.carId === id);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Voiture introuvable</p>
          <button onClick={() => navigate("/catalogue")} className="px-6 py-2 bg-green-500 text-white rounded-xl text-sm cursor-pointer whitespace-nowrap">
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  // Hardcoded images per car — precise prompts with unique seq IDs per car
  const carExtraImages: Record<string, { interior: string; rear: string; labels: [string, string] }> = {
    "1": {
      interior: "https://readdy.ai/api/search-image?query=Dacia%20Logan%20MCV%20interior%20grey%20fabric%20seats%20dashboard%20steering%20wheel%20simple%20clean%20cabin%20automotive%20photography%20studio%20light%20neutral%20background%202023&width=400&height=280&seq=dacia_logan_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Dacia%20Logan%20white%20sedan%20rear%20three%20quarter%20view%20clean%20light%20studio%20background%20professional%20automotive%20photography%20compact%20Morocco%20rental%202023&width=400&height=280&seq=dacia_logan_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "2": {
      interior: "https://readdy.ai/api/search-image?query=Renault%20Clio%20V%20interior%20modern%20cockpit%20digital%20dashboard%20red%20stitching%20fabric%20seats%20touchscreen%20infotainment%20compact%20hatchback%20cabin%20studio%20light%202023&width=400&height=280&seq=renault_clio_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Renault%20Clio%20V%20red%20hatchback%20rear%20back%20three%20quarter%20angle%20clean%20white%20studio%20background%20professional%20automotive%20photography%20France%20compact%202023&width=400&height=280&seq=renault_clio_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "3": {
      interior: "https://readdy.ai/api/search-image?query=Hyundai%20Tucson%20NX4%20interior%20premium%20leather%20seats%20panoramic%20sunroof%20dual%20zone%20climate%20control%20large%20touchscreen%20dashboard%20SUV%20cabin%20studio%202023&width=400&height=280&seq=hyundai_tucson_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Hyundai%20Tucson%20NX4%20silver%20grey%20SUV%20rear%20three%20quarter%20back%20view%20clean%20white%20studio%20background%20crossover%20automotive%20photography%20Morocco%202023&width=400&height=280&seq=hyundai_tucson_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "4": {
      interior: "https://readdy.ai/api/search-image?query=Toyota%20Corolla%20Hybrid%20E210%20interior%20black%20dashboard%20digital%20display%20hybrid%20badge%20Apple%20CarPlay%20clean%20modern%20sedan%20cabin%20studio%20light%202023&width=400&height=280&seq=toyota_corolla_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Toyota%20Corolla%20Hybrid%20black%20dark%20sedan%20rear%20three%20quarter%20back%20view%20clean%20light%20studio%20background%20elegant%20professional%20automotive%20photography%202023&width=400&height=280&seq=toyota_corolla_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "5": {
      interior: "https://readdy.ai/api/search-image?query=Peugeot%20208%20second%20gen%20interior%20i-Cockpit%20raised%20dashboard%20digital%20instruments%20small%20steering%20wheel%20blue%20accent%20compact%20hatchback%20studio%20automotive%20photography%202023&width=400&height=280&seq=peugeot_208_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Peugeot%20208%20blue%20elixir%20metallic%20hatchback%20rear%20three%20quarter%20back%20view%20clean%20white%20studio%20background%20professional%20automotive%20photography%20France%20compact%202023&width=400&height=280&seq=peugeot_208_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "6": {
      interior: "https://readdy.ai/api/search-image?query=Volkswagen%20Tiguan%20Mk2%20interior%20Virtual%20Cockpit%20digital%20dashboard%20leather%20seats%20panoramic%20roof%20ambient%20lighting%20premium%20Germany%20SUV%20cabin%20studio%202023&width=400&height=280&seq=vw_tiguan_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Volkswagen%20Tiguan%20grey%20moonstone%20metallic%20SUV%20rear%20three%20quarter%20back%20view%20clean%20white%20studio%20background%20premium%20automotive%20photography%20Germany%202023&width=400&height=280&seq=vw_tiguan_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "7": {
      interior: "https://readdy.ai/api/search-image?query=Mercedes%20Benz%20C%20Class%20W206%20interior%20Nappa%20leather%20MBUX%20infotainment%20system%20ambient%20lighting%20wood%20trim%20luxury%20sedan%20cabin%20studio%20photography%202023&width=400&height=280&seq=mercedes_c_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Mercedes%20Benz%20C%20Class%20W206%20silver%20luxury%20sedan%20rear%20three%20quarter%20back%20view%20clean%20white%20studio%20background%20elegant%20premium%20automotive%20photography%20Germany%202023&width=400&height=280&seq=mercedes_c_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
    "8": {
      interior: "https://readdy.ai/api/search-image?query=Ford%20Transit%20Mk8%20interior%20cargo%20van%20large%20cabin%20nine%20seats%20dashboard%20steering%20wheel%20utility%20vehicle%20white%20interior%20clean%20studio%20automotive%20photography%202023&width=400&height=280&seq=ford_transit_int_v2&orientation=landscape",
      rear: "https://readdy.ai/api/search-image?query=Ford%20Transit%20Mk8%20white%20utility%20cargo%20van%20rear%20back%20doors%20open%20large%20loading%20area%20clean%20light%20studio%20background%20professional%20automotive%20photography%202023&width=400&height=280&seq=ford_transit_rear_v2&orientation=landscape",
      labels: ["Intérieur", "Vue arrière"],
    },
  };

  const extra = carExtraImages[car.id];
  const images = extra
    ? [
        { src: car.image, label: "Extérieur" },
        { src: extra.interior, label: extra.labels[0] },
        { src: extra.rear, label: extra.labels[1] },
      ]
    : [{ src: car.image, label: "Extérieur" }];

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
              <div className="w-7 h-7 flex items-center justify-center bg-green-500 rounded-lg">
                <i className="ri-car-fill text-white text-xs" />
              </div>
              <span className="text-sm font-bold text-green-700">AutoMaroc</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
              <i className="ri-shopping-cart-line text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Link>
            <Link to="/notifications" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
              <i className="ri-notification-3-line text-gray-600" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Images */}
          <div>
            {/* Main image */}
            <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-3 bg-gray-100">
              <img src={images[activeImg].src} alt={`${car.name} - ${images[activeImg].label}`} className="w-full h-full object-cover object-top" />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${
                    activeImg === i ? "border-green-500" : "border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover object-top" />
                  <div className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-xs font-medium ${activeImg === i ? "bg-green-500 text-white" : "bg-black/40 text-white"}`}>
                    {img.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Info */}
          <div>
            {/* Badge + title */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{car.category}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${car.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {car.available ? "Disponible" : "Indisponible"}
              </span>
              {inCart && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">Dans le panier</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{car.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{car.brand}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={car.rating} />
              <span className="text-sm font-semibold text-gray-700">{car.rating}</span>
              <span className="text-sm text-gray-400">({relatedReviews.length} avis)</span>
            </div>

            {/* Price */}
            <div className="p-4 bg-green-50 rounded-2xl mb-5">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-green-600">{car.pricePerDay}</span>
                <span className="text-lg font-semibold text-green-500">MAD</span>
                <span className="text-sm text-gray-500 mb-0.5">/jour</span>
              </div>
              <p className="text-xs text-green-700 mt-1">Assurance incluse • Kilométrage illimité</p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: "ri-user-line", label: "Places", value: `${car.seats}` },
                { icon: "ri-settings-3-line", label: "Boîte", value: car.transmission },
                { icon: "ri-gas-station-line", label: "Carburant", value: car.fuel },
                { icon: "ri-map-pin-line", label: "Ville", value: car.city },
              ].map((spec) => (
                <div key={spec.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <div className="w-6 h-6 flex items-center justify-center mx-auto mb-1">
                    <i className={`${spec.icon} text-green-500 text-base`} />
                  </div>
                  <p className="text-xs text-gray-400">{spec.label}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            {car.available ? (
              <button
                onClick={() => setShowBooking(true)}
                className="w-full py-3.5 bg-green-500 text-white rounded-2xl text-base font-bold hover:bg-green-600 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <i className="ri-calendar-check-line mr-2" />
                Réserver cette voiture
              </button>
            ) : (
              <button disabled className="w-full py-3.5 bg-gray-100 text-gray-400 rounded-2xl text-base font-bold cursor-not-allowed whitespace-nowrap">
                Voiture indisponible
              </button>
            )}
          </div>
        </div>

        {/* Description + Features */}
        {details && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-3">À propos de ce véhicule</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{details.description}</p>
              <h3 className="text-sm font-bold text-gray-700 mt-4 mb-3">Équipements</h3>
              <div className="flex flex-wrap gap-2">
                {details.features.map((f) => (
                  <span key={f} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-4">Conditions de location</h2>
              <ul className="space-y-2.5">
                {details.conditions.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-checkbox-circle-fill text-green-500 text-sm" />
                    </div>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4">Avis clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedReviews.map((r, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full flex-shrink-0">
                    <i className="ri-user-line text-green-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                </div>
                <StarRating rating={r.rating} />
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                <p className="text-xs text-gray-400 mt-2">{r.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          car={{ id: car.id, name: car.name, brand: car.brand, image: car.image, pricePerDay: car.pricePerDay, city: car.city }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
