import { type Dispatch, type SetStateAction } from "react";

const ALL_CITIES = ["Toutes les villes", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"];

interface HeroSectionProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  selectedCity: string;
  setSelectedCity: Dispatch<SetStateAction<string>>;
}

export function HeroSection({ search, setSearch, selectedCity, setSelectedCity }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      <img
        src="https://readdy.ai/api/search-image?query=Morocco%20landscape%20road%20scenic%20panoramic%20view%20Atlas%20mountains%20highway%20driving%20adventure%20travel%20golden%20hour%20warm%20light%20green%20nature%20beautiful%20countryside%20roads%20Morocco&width=1400&height=600&seq=herobg21&orientation=landscape"
        alt="AutoMaroc Hero"
        className="w-full h-[480px] md:h-[560px] object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-map-pin-2-fill text-green-300 text-sm" />
            </div>
            Disponible dans 6 villes au Maroc
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Louez votre voiture<br />
            <span className="text-green-300">partout au Maroc</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto">
            Des centaines de véhicules disponibles — prix en dirhams, sans frais cachés
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-base" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une marque ou modèle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50 transition-all"
            />
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-map-pin-line text-gray-400 text-sm" />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-9 pr-8 py-3 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer bg-gray-50 w-full sm:w-auto appearance-none"
            >
              {ALL_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap active:scale-95">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-sm" />
              </div>
              Rechercher
            </span>
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 mt-6 flex-wrap justify-center">
          {[
            { val: "48+", label: "Voitures" },
            { val: "6", label: "Villes" },
            { val: "1000+", label: "Clients satisfaits" },
            { val: "250 MAD", label: "Dès /jour" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-bold text-xl">{s.val}</p>
              <p className="text-white/70 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
