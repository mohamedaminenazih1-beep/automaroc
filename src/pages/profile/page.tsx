import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "El Jadida", "Safi",
];

type Tab = "info" | "password" | "stats";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, changePassword, logout } = useAuth();
  const { userBookings, cart, unreadCount } = useBooking();
  const bookings = user ? userBookings(user.id) : [];

  const [activeTab, setActiveTab] = useState<Tab>("info");

  // Info form state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [city, setCity] = useState(user?.ville ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState("");

  // Password form state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated || !user) {
    navigate("/");
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateUser({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");
    if (!name.trim()) { setInfoError("Le nom est requis"); return; }
    if (!email.trim()) { setInfoError("L&apos;email est requis"); return; }
    updateUser({ name: name.trim(), email: email.trim(), ville: city, phone: phone.trim() });
    setInfoSuccess(true);
    setTimeout(() => setInfoSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess(false);
    if (!currentPwd) { setPwdError("Entrez le mot de passe actuel"); return; }
    if (newPwd.length < 6) { setPwdError("Le nouveau mot de passe doit contenir au moins 6 caractères"); return; }
    if (newPwd !== confirmPwd) { setPwdError("Les mots de passe ne correspondent pas"); return; }
    const result = changePassword(currentPwd, newPwd);
    if (!result.success) { setPwdError(result.error ?? "Erreur"); return; }
    setPwdSuccess(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "active" || b.status === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7fdf7" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="w-full px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/catalogue")}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
            >
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
            <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-shopping-cart-line text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Link>
            <Link to="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-notification-3-line text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header card */}
        <div
          className="rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-10 -left-4 w-32 h-32 rounded-full opacity-10 bg-white" />

          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 bg-green-400 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 flex items-center justify-center bg-white rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <i className="ri-camera-line text-green-600 text-xs" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{user.name}</h1>
              <p className="text-green-200 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium capitalize">
                  {user.role === "client" ? "Client" : user.role}
                </span>
                {user.ville && (
                  <span className="text-green-200 text-xs flex items-center gap-1">
                    <i className="ri-map-pin-line" />
                    {user.ville}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-logout-box-line" />
              Déconnexion
            </button>
          </div>

          {/* Stats row */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: "ri-car-line", val: bookings.length, label: "Réservations" },
              { icon: "ri-check-double-line", val: confirmedCount, label: "Confirmées" },
              { icon: "ri-money-dollar-circle-line", val: `${totalSpent.toLocaleString()} MAD`, label: "Total dépensé" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className="w-6 h-6 flex items-center justify-center mx-auto mb-1">
                  <i className={`${s.icon} text-white/80 text-base`} />
                </div>
                <p className="text-white font-bold text-sm">{s.val}</p>
                <p className="text-green-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 mb-6 border border-gray-100">
          {([
            { id: "info" as Tab, icon: "ri-user-3-line", label: "Informations" },
            { id: "password" as Tab, icon: "ri-lock-password-line", label: "Mot de passe" },
            { id: "stats" as Tab, icon: "ri-bar-chart-2-line", label: "Activité" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-green-500 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon} />
              </div>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Informations */}
        {activeTab === "info" && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-user-3-line text-green-500" />
              </div>
              Informations personnelles
            </h2>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-user-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Adresse email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-mail-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-phone-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ville</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-map-pin-line text-gray-400 text-sm" />
                    </div>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner une ville</option>
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {infoError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-error-warning-line text-red-500 text-sm" />
                  </div>
                  <p className="text-xs text-red-600">{infoError}</p>
                </div>
              )}

              {infoSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-checkbox-circle-line text-green-500 text-sm" />
                  </div>
                  <p className="text-xs text-green-600 font-medium">Profil mis à jour avec succès !</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-save-line" />
                  </div>
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Mot de passe */}
        {activeTab === "password" && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-lock-password-line text-green-500" />
              </div>
              Changer le mot de passe
            </h2>
            <p className="text-xs text-gray-400 mb-5">Choisissez un mot de passe fort d&apos;au moins 6 caractères.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              {/* Current password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mot de passe actuel</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-line text-gray-400 text-sm" />
                  </div>
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer"
                  >
                    <i className={`${showCurrent ? "ri-eye-off-line" : "ri-eye-line"} text-gray-400 text-sm`} />
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-password-line text-gray-400 text-sm" />
                  </div>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer"
                  >
                    <i className={`${showNew ? "ri-eye-off-line" : "ri-eye-line"} text-gray-400 text-sm`} />
                  </button>
                </div>
                {/* Strength bar */}
                {newPwd.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          newPwd.length >= i * 2
                            ? newPwd.length >= 8 ? "bg-green-400" : newPwd.length >= 6 ? "bg-yellow-400" : "bg-red-400"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {newPwd.length < 6 ? "Faible" : newPwd.length < 8 ? "Moyen" : "Fort"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-password-line text-gray-400 text-sm" />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 transition-all ${
                      confirmPwd && confirmPwd !== newPwd
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-green-400 focus:ring-green-100"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer"
                  >
                    <i className={`${showConfirm ? "ri-eye-off-line" : "ri-eye-line"} text-gray-400 text-sm`} />
                  </button>
                </div>
                {confirmPwd && confirmPwd !== newPwd && (
                  <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {pwdError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-error-warning-line text-red-500 text-sm" />
                  </div>
                  <p className="text-xs text-red-600">{pwdError}</p>
                </div>
              )}

              {pwdSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-shield-check-line text-green-500 text-sm" />
                  </div>
                  <p className="text-xs text-green-600 font-medium">Mot de passe modifié avec succès !</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-shield-keyhole-line" />
                  </div>
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Activité */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "ri-car-line", val: bookings.length, label: "Total réservations", color: "text-green-600", bg: "bg-green-50" },
                { icon: "ri-check-double-line", val: confirmedCount, label: "Confirmées", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: "ri-close-circle-line", val: bookings.filter((b) => b.status === "cancelled").length, label: "Annulées", color: "text-red-500", bg: "bg-red-50" },
                { icon: "ri-shopping-cart-line", val: cart.length, label: "Dans le panier", color: "text-orange-500", bg: "bg-orange-50" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <i className={`${s.icon} ${s.color} text-xl`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Dernières réservations</h3>
                <Link to="/history" className="text-xs text-green-600 hover:underline font-medium">
                  Voir tout
                </Link>
              </div>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-gray-100 rounded-full">
                    <i className="ri-car-line text-gray-400 text-xl" />
                  </div>
                  <p className="text-sm text-gray-400">Aucune réservation pour l&apos;instant</p>
                  <Link to="/catalogue" className="mt-3 inline-block text-xs text-green-600 font-medium hover:underline">
                    Explorer les voitures
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 4).map((b) => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      pending:   { label: "En attente", color: "text-yellow-600" },
                      confirmed: { label: "Confirmée",  color: "text-green-600" },
                      active:    { label: "En cours",   color: "text-orange-600" },
                      completed: { label: "Terminée",   color: "text-gray-500" },
                      cancelled: { label: "Annulée",    color: "text-red-500" },
                    };
                    const s = statusMap[b.status] ?? { label: b.status, color: "text-gray-600" };
                    return (
                      <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                        <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={b.carImage} alt={b.carName} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{b.carName}</p>
                          <p className="text-xs text-gray-400">{b.startDate} → {b.endDate}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-700">{b.totalPrice.toLocaleString()} MAD</p>
                          <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Spending chart (simple visual) */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Récapitulatif des dépenses</h3>
              <div className="flex items-end gap-3 justify-center">
                <div className="text-center">
                  <div className="w-16 bg-green-500 rounded-t-lg mx-auto" style={{ height: `${Math.min(100, (totalSpent / 5000) * 80 + 20)}px` }} />
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                  <p className="text-xs font-bold text-green-600">{totalSpent.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-16 bg-emerald-300 rounded-t-lg mx-auto"
                    style={{ height: `${Math.min(100, (bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0) / 5000) * 80 + 10)}px` }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Valides</p>
                  <p className="text-xs font-bold text-emerald-600">
                    {bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="w-16 bg-red-200 rounded-t-lg mx-auto"
                    style={{ height: `${Math.min(80, (bookings.filter((b) => b.status === "cancelled").reduce((s, b) => s + b.totalPrice, 0) / 5000) * 80 + 10)}px` }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Annulées</p>
                  <p className="text-xs font-bold text-red-400">
                    {bookings.filter((b) => b.status === "cancelled").reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">En dirhams (MAD)</p>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { to: "/history", icon: "ri-history-line", label: "Historique" },
            { to: "/cart", icon: "ri-shopping-cart-line", label: "Panier" },
            { to: "/notifications", icon: "ri-notification-3-line", label: "Notifications" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-green-200 hover:bg-green-50 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                <i className={`${link.icon} text-green-600`} />
              </div>
              <span className="text-xs font-medium text-gray-600">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
