import { useNavigate } from "react-router-dom";

export function CtaSection() {
  const navigate = useNavigate();
  return (
    <section className="py-16 px-4 md:px-6 relative overflow-hidden">
      <img
        src="https://readdy.ai/api/search-image?query=Morocco%20desert%20dunes%20sunset%20warm%20orange%20golden%20light%20panoramic%20scenic%20beautiful%20natural%20landscape%20travel%20adventure%20wide%20angle%20Sahara&width=1400&height=400&seq=ctabg1&orientation=landscape"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-700/70" />
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 flex items-center justify-center bg-white/20 rounded-full mx-auto mb-6">
          <i className="ri-car-fill text-white text-3xl" />
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
          Prêt à prendre la route ?
        </h2>
        <p className="text-white/80 text-sm md:text-base mb-8 max-w-xl mx-auto">
          Réservez votre voiture en quelques clics. Des véhicules disponibles partout au Maroc, à partir de 250 MAD/jour.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-white text-green-700 font-bold rounded-full text-sm hover:bg-green-50 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Créer un compte gratuit
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("cars-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3 bg-white/20 text-white font-semibold rounded-full text-sm hover:bg-white/30 transition-all cursor-pointer whitespace-nowrap border border-white/40"
          >
            Voir nos voitures
          </button>
        </div>
      </div>
    </section>
  );
}
