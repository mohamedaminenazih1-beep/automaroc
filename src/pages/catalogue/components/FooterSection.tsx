export function FooterSection() {
  return (
    <footer style={{ backgroundColor: "#1a3c1e" }} className="text-white py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 flex items-center justify-center bg-green-500 rounded-xl">
                <i className="ri-car-fill text-white text-lg" />
              </div>
              <div>
                <p className="text-base font-bold text-white">AutoMaroc</p>
                <p className="text-xs text-green-400">Location de Voiture</p>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Votre partenaire de confiance pour la location de voitures au Maroc. Des véhicules de qualité, des prix transparents.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {["ri-facebook-fill", "ri-instagram-line", "ri-twitter-x-line", "ri-whatsapp-line"].map((icon) => (
                <div key={icon} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-green-500 transition-colors cursor-pointer">
                  <i className={`${icon} text-sm text-white`} />
                </div>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              {["Nos voitures", "Tarifs", "Nos agences", "À propos", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-white/60 hover:text-green-400 transition-colors flex items-center gap-1">
                    <i className="ri-arrow-right-s-line text-xs text-green-500" />
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Nos agences</h4>
            <ul className="space-y-2">
              {["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"].map((v) => (
                <li key={v}>
                  <a href="#" className="text-xs text-white/60 hover:text-green-400 transition-colors flex items-center gap-1">
                    <i className="ri-map-pin-line text-xs text-green-500" />
                    {v}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              {[
                { icon: "ri-phone-line", text: "+212 5 22 00 00 00" },
                { icon: "ri-mail-line", text: "contact@automaroc.ma" },
                { icon: "ri-map-pin-line", text: "Casablanca, Maroc" },
                { icon: "ri-time-line", text: "Lun–Sam : 8h–20h" },
              ].map((c) => (
                <li key={c.icon} className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${c.icon} text-green-400 text-sm`} />
                  </div>
                  <span className="text-xs text-white/60">{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 AutoMaroc — Tous droits réservés</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">Conditions d&apos;utilisation</a>
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
