import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { HeroSection } from "./components/HeroSection";
import { CarsGrid } from "./components/CarsGrid";
import { ServicesSection } from "./components/ServicesSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { FaqSection } from "./components/FaqSection";
import { CtaSection } from "./components/CtaSection";
import { FooterSection } from "./components/FooterSection";

export default function Catalogue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart, unreadCount } = useBooking();
  const [selectedCity, setSelectedCity] = useState("Toutes les villes");
  const [selectedCat, setSelectedCat] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7fdf7" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-xl">
              <i className="ri-car-fill text-white text-sm" />
            </div>
            <span className="text-base font-bold text-green-700">AutoMaroc</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => { const el = document.getElementById("cars-section"); el?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">Nos voitures</button>
            <button onClick={() => { const el = document.getElementById("services-section"); el?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm text-gray-500 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">Services</button>
            <button onClick={() => { const el = document.getElementById("reviews-section"); el?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm text-gray-500 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">Avis</button>
            <button onClick={() => { const el = document.getElementById("faq-section"); el?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm text-gray-500 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">FAQ</button>
          </div>
          <div className="flex items-center gap-2">
            {user && user.role !== "guest" && (
              <>
                <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <i className="ri-shopping-cart-line text-gray-600" />
                  {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
                </Link>
                <Link to="/history" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <i className="ri-history-line text-gray-600" />
                </Link>
                <Link to="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <i className="ri-notification-3-line text-gray-600" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
                </Link>
              </>
            )}
            {user && user.role !== "guest" ? (
              <div className="relative">
                <button onClick={() => setMenuOpen((p) => !p)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
                    <i className="ri-user-line text-white text-xs" />
                  </div>
                  <span className="text-sm font-medium text-green-700 hidden sm:inline whitespace-nowrap">{user.name}</span>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-green-600 text-sm" />
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 py-2 z-50">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-3-line text-gray-500 text-sm" /></div>
                      Mon profil
                    </Link>
                    <Link to="/history" onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-history-line text-gray-500 text-sm" /></div>
                      Mes réservations
                    </Link>
                    <Link to="/cart" onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shopping-cart-line text-gray-500 text-sm" /></div>
                      Mon panier
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-line text-red-400 text-sm" /></div>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50 rounded-full transition-colors cursor-pointer whitespace-nowrap">Se connecter</button>
                <button onClick={() => navigate("/signup")} className="px-4 py-2 text-sm bg-green-500 text-white font-medium rounded-full hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">S&apos;inscrire</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection search={search} setSearch={setSearch} selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

      {/* Cars Grid */}
      <div id="cars-section">
        <CarsGrid search={search} selectedCity={selectedCity} selectedCat={selectedCat} setSelectedCat={setSelectedCat} />
      </div>

      {/* Services */}
      <div id="services-section">
        <ServicesSection />
      </div>

      {/* Reviews */}
      <div id="reviews-section">
        <ReviewsSection />
      </div>

      {/* About / Brand */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">À PROPOS</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                AutoMaroc, votre partenaire<br />
                <span className="text-green-600">de confiance depuis 2015</span>
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Fondée à Casablanca, AutoMaroc est la première plateforme de location de voitures entièrement dédiée au Maroc. Nous mettons à votre disposition une flotte de plus de 48 véhicules récents, couvrant 6 grandes villes marocaines.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Notre mission : vous offrir une mobilité simple, sécurisée et abordable, avec des prix transparents en dirhams et un service client disponible 7j/7.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: "48+", label: "Véhicules" },
                  { val: "6", label: "Villes" },
                  { val: "10ans+", label: "Expérience" },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-green-50 rounded-2xl py-4">
                    <p className="text-xl font-bold text-green-700">{s.val}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative rounded-3xl overflow-hidden w-full h-72 lg:h-96">
                <img
                  src="https://readdy.ai/api/search-image?query=Moroccan%20car%20rental%20agency%20professional%20team%20friendly%20staff%20modern%20office%20Casablanca%20Morocco%20interior%20clean%20bright%20welcoming%20customer%20service&width=600&height=400&seq=about1&orientation=landscape"
                  alt="À propos AutoMaroc"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-500 rounded-xl">
                    <i className="ri-award-line text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Certifié & Agréé</p>
                    <p className="text-xs text-green-600">Ministère du Transport — Maroc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div id="faq-section">
        <FaqSection />
      </div>

      {/* CTA */}
      <CtaSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
