import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { mockCars } from "@/mocks/cars";
import { ReturnInspectionModal } from "./components/ReturnInspectionModal";
import type { BookingItem, ReturnInspection } from "@/mocks/bookings";

type ManagerTab = "parc" | "reservations" | "compte-rendu";
type BookingStatus = "active" | "completed" | "pending" | "cancelled" | "confirmed" | "refused";

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "En cours",   color: "text-orange-700", bg: "bg-orange-50" },
  completed: { label: "Terminée",   color: "text-gray-600",   bg: "bg-gray-100" },
  pending:   { label: "En attente", color: "text-yellow-700", bg: "bg-yellow-50" },
  cancelled: { label: "Annulée",    color: "text-red-600",    bg: "bg-red-50" },
  confirmed: { label: "Confirmée",  color: "text-green-700",  bg: "bg-green-100" },
  refused:   { label: "Refusée",    color: "text-red-700",    bg: "bg-red-100" },
};


export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { allBookings, managerConfirmRemise, managerConfirmRetour } = useBooking();
  const [activeTab, setActiveTab] = useState<ManagerTab>("parc");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");
  const [searchBooking, setSearchBooking] = useState("");
  const [viewBooking, setViewBooking] = useState<BookingItem | null>(null);
  const [remiseTarget, setRemiseTarget] = useState<BookingItem | null>(null);
  const [retourTarget, setRetourTarget] = useState<BookingItem | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);
  const [cars, setCars] = useState(mockCars.map((c) => ({ ...c })));

  if (!user || role !== "gestionnaire") {
    navigate("/");
    return null;
  }

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const navItems: { id: ManagerTab; icon: string; label: string; badge?: number }[] = [
    { id: "parc", icon: "ri-car-line", label: "Parc de voitures" },
    {
      id: "reservations",
      icon: "ri-calendar-check-line",
      label: "Réservations",
      badge: allBookings.filter((b) => b.status === "confirmed" && !b.remiseConfirmed).length || undefined,
    },
    { id: "compte-rendu", icon: "ri-file-chart-line", label: "Compte rendu" },
  ];

  const toggleAvail = (id: string) => {
    setCars((prev) => prev.map((c) => c.id === id ? { ...c, available: !c.available } : c));
    showToast("Disponibilité mise à jour !", "info");
  };

  const handleConfirmRemise = () => {
    if (!remiseTarget) return;
    managerConfirmRemise(remiseTarget.id);
    showToast(`Remise confirmée pour ${remiseTarget.clientPrenom} ${remiseTarget.clientNom} — ${remiseTarget.carName} !`);
    setRemiseTarget(null);
  };

  const handleConfirmRetour = (inspection: ReturnInspection) => {
    if (!retourTarget) return;
    managerConfirmRetour(retourTarget.id, inspection);
    const hasExtras = inspection.totalExtraFees > 0;
    showToast(hasExtras
      ? `Retour validé — ${inspection.totalExtraFees.toLocaleString()} MAD de frais supplémentaires. Client notifié.`
      : `Retour validé — aucun frais supplémentaire. Véhicule remis en disponibilité !`
    );
    setRetourTarget(null);
  };

  const filteredBookings = allBookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const name = `${b.clientPrenom} ${b.clientNom}`.toLowerCase();
    const matchSearch = name.includes(searchBooking.toLowerCase()) || b.carName.toLowerCase().includes(searchBooking.toLowerCase()) || b.id.toLowerCase().includes(searchBooking.toLowerCase());
    return matchStatus && matchSearch;
  });

  const generateCompteRendu = () => {
    const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const completed = allBookings.filter((b) => b.status === "completed" || b.status === "active");
    const totalRev = completed.reduce((s, b) => s + (b.finalPrice ?? b.totalPrice), 0);
    const content = `
COMPTE RENDU DES RÉSERVATIONS — AutoMaroc
Gestionnaire : ${user?.name} | Généré le : ${now}
${"=".repeat(60)}

RÉSUMÉ
• Total réservations  : ${allBookings.length}
• En cours           : ${allBookings.filter((b) => b.status === "active").length}
• Terminées          : ${allBookings.filter((b) => b.status === "completed").length}
• Confirmées         : ${allBookings.filter((b) => b.status === "confirmed").length}
• Annulées/Refusées  : ${allBookings.filter((b) => b.status === "cancelled" || b.status === "refused").length}
• Revenu total       : ${totalRev.toLocaleString()} MAD

${"=".repeat(60)}
${allBookings.map((b) => `[${b.id}] ${b.clientPrenom} ${b.clientNom} — ${b.carName}
  Période : ${b.startDate} → ${b.endDate} | Statut : ${b.status}
  Villes : ${b.villeDepart} → ${b.villeRetour}
  Montant : ${(b.finalPrice ?? b.totalPrice).toLocaleString()} MAD | Paiement : ${b.paymentStatus}`).join("\n\n")}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `compte_rendu_${today}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast("Compte rendu téléchargé !");
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f7fdf7" }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 text-white text-sm px-5 py-3 rounded-2xl font-medium ${toast.type === "success" ? "bg-green-500" : "bg-orange-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col flex-shrink-0`} style={{ minHeight: "100vh" }}>
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-orange-500 rounded-xl flex-shrink-0">
            <i className="ri-tools-line text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-sm font-bold text-orange-700 whitespace-nowrap">Gestionnaire</span>}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === item.id ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-base`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold" style={{ fontSize: "9px" }}>{item.badge}</span>
                )}
              </div>
              {sidebarOpen && <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>}
              {sidebarOpen && item.badge && item.badge > 0 ? (
                <span className="ml-auto bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="px-2 pb-4 border-t border-gray-100 pt-3">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-orange-500 font-medium">Gestionnaire</p>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 cursor-pointer whitespace-nowrap">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0"><i className="ri-logout-box-line text-base" /></div>
            {sidebarOpen && "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen((p) => !p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
            <i className="ri-menu-line text-gray-600 text-lg" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800">{navItems.find((n) => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-gray-400">AutoMaroc — Espace gestionnaire</p>
          </div>
          <div className="w-8 h-8 flex items-center justify-center bg-orange-100 rounded-full">
            <i className="ri-tools-line text-orange-600 text-sm" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: "Total voitures",       value: cars.length,                                                                   icon: "ri-car-fill",             color: "text-green-600",  bg: "bg-green-50" },
              { label: "Disponibles",          value: cars.filter((c) => c.available).length,                                        icon: "ri-checkbox-circle-line", color: "text-green-500",  bg: "bg-green-50" },
              { label: "En location",          value: allBookings.filter((b) => b.status === "active").length,                       icon: "ri-steering-2-line",      color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Remises en attente",   value: allBookings.filter((b) => b.status === "confirmed" && !b.remiseConfirmed).length, icon: "ri-key-2-line",         color: "text-yellow-600", bg: "bg-yellow-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                  <i className={`${stat.icon} ${stat.color} text-lg`} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ── PARC TAB ── */}
          {activeTab === "parc" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700">Disponibilité du parc</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cars.map((car) => (
                  <div key={car.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="relative w-full h-36">
                      <img src={car.image} alt={car.name} className="w-full h-full object-cover object-top" />
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${car.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {car.available ? "Libre" : "Loué"}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-gray-800">{car.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{car.city}</span>
                        <span className="text-xs font-bold text-green-600">{car.pricePerDay} MAD/j</span>
                      </div>
                      <button onClick={() => toggleAvail(car.id)}
                        className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${car.available ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                        {car.available ? "Marquer en location" : "Marquer disponible"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESERVATIONS TAB ── */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400 text-sm" />
                  </div>
                  <input value={searchBooking} onChange={(e) => setSearchBooking(e.target.value)} placeholder="Client, voiture, ID..."
                    className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 w-52" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "pending", "confirmed", "active", "completed", "cancelled", "refused"] as (BookingStatus | "all")[]).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${filterStatus === s ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                      {s === "all" ? "Toutes" : STATUS_CONFIG[s as BookingStatus].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {["ID", "Client", "Voiture", "Période", "Total", "Statut", "Remise", "Retour", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBookings.map((b) => {
                        const s = STATUS_CONFIG[b.status as BookingStatus];
                        const canRemise = b.status === "confirmed" && !b.remiseConfirmed;
                        const canRetour = b.status === "active" && b.remiseConfirmed && !b.retourConfirmed;
                        return (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-gray-500 font-semibold">{b.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{b.clientPrenom} {b.clientNom}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.carName}</td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{b.startDate} → {b.endDate}</td>
                            <td className="px-4 py-3 font-bold text-green-700 whitespace-nowrap">{(b.finalPrice ?? b.totalPrice).toLocaleString()} MAD</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s?.bg} ${s?.color}`}>{s?.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              {b.remiseConfirmed ? (
                                <span className="flex items-center gap-1 text-green-600 font-semibold text-xs whitespace-nowrap"><i className="ri-check-line" /> Faite</span>
                              ) : canRemise ? (
                                <button onClick={() => setRemiseTarget(b)}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 cursor-pointer whitespace-nowrap">
                                  <i className="ri-key-2-line text-xs" /> Confirmer
                                </button>
                              ) : <span className="text-gray-400 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              {b.retourConfirmed ? (
                                <span className="flex items-center gap-1 text-green-600 font-semibold text-xs whitespace-nowrap"><i className="ri-check-line" /> Fait</span>
                              ) : canRetour ? (
                                <button onClick={() => setRetourTarget(b)}
                                  className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-100 cursor-pointer whitespace-nowrap">
                                  <i className="ri-car-line text-xs" /> Inspecter
                                </button>
                              ) : <span className="text-gray-400 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => setViewBooking(b)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 cursor-pointer">
                                <i className="ri-eye-line text-sm" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredBookings.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune réservation trouvée</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── COMPTE RENDU ── */}
          {activeTab === "compte-rendu" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-800">Compte rendu des réservations</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Généré le {new Date().toLocaleDateString("fr-FR")}</p>
                  </div>
                  <button onClick={generateCompteRendu} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                    <i className="ri-download-2-line" /> Télécharger (.txt)
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  {[
                    { label: "Total",       val: allBookings.length,                                                                   color: "text-gray-800",  bg: "bg-gray-50" },
                    { label: "Confirmées",  val: allBookings.filter((b) => b.status === "confirmed").length,                           color: "text-green-700", bg: "bg-green-50" },
                    { label: "En cours",    val: allBookings.filter((b) => b.status === "active").length,                              color: "text-orange-600",bg: "bg-orange-50" },
                    { label: "Terminées",   val: allBookings.filter((b) => b.status === "completed").length,                           color: "text-gray-600",  bg: "bg-gray-100" },
                    { label: "Annulées",    val: allBookings.filter((b) => b.status === "cancelled" || b.status === "refused").length, color: "text-red-600",   bg: "bg-red-50" },
                    { label: "Revenus MAD", val: allBookings.filter((b) => b.status !== "cancelled" && b.status !== "refused").reduce((s, b) => s + (b.finalPrice ?? b.totalPrice), 0).toLocaleString(), color: "text-green-700", bg: "bg-green-50" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-gray-100`}>
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500">Récapitulatif</div>
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {allBookings.map((b) => {
                      const s = STATUS_CONFIG[b.status as BookingStatus];
                      return (
                        <div key={b.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-sm">
                          <span className="font-mono text-gray-400 text-xs w-12 flex-shrink-0">{b.id}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{b.clientPrenom} {b.clientNom}</p>
                            <p className="text-xs text-gray-400">{b.carName} · {b.startDate} → {b.endDate}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s?.bg} ${s?.color}`}>{s?.label}</span>
                            <span className="font-bold text-green-700 text-xs">{(b.finalPrice ?? b.totalPrice).toLocaleString()} MAD</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── REMISE CONFIRM ── */}
      {remiseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-2xl mx-auto mb-4">
              <i className="ri-key-2-line text-green-600 text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Confirmer la remise du véhicule</h3>
            <div className="bg-gray-50 rounded-xl p-3 mb-5 text-left text-sm space-y-1.5">
              {[
                { l: "Client", v: `${remiseTarget.clientPrenom} ${remiseTarget.clientNom}` },
                { l: "CIN", v: remiseTarget.clientCIN },
                { l: "Véhicule", v: remiseTarget.carName },
                { l: "Début", v: `${remiseTarget.startDate} à ${remiseTarget.startTime}` },
              ].map((r) => (
                <div key={r.l} className="flex justify-between text-xs">
                  <span className="text-gray-500">{r.l}</span>
                  <span className="font-semibold">{r.v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-5">En confirmant, le véhicule passera en statut «&nbsp;En cours&nbsp;».</p>
            <div className="flex gap-3">
              <button onClick={() => setRemiseTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap">Annuler</button>
              <button onClick={handleConfirmRemise} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">Confirmer remise</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RETOUR INSPECTION MODAL ── */}
      {retourTarget && (
        <ReturnInspectionModal
          booking={retourTarget}
          onConfirm={handleConfirmRetour}
          onClose={() => setRetourTarget(null)}
        />
      )}

      {/* ── VIEW BOOKING ── */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">Détail — {viewBooking.id}</h3>
              <button onClick={() => setViewBooking(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { l: "Client", v: `${viewBooking.clientPrenom} ${viewBooking.clientNom}` },
                { l: "Email", v: viewBooking.clientEmail },
                { l: "Tél", v: viewBooking.clientPhone },
                { l: "CIN", v: viewBooking.clientCIN },
                { l: "Permis", v: viewBooking.clientNumPermis },
                { l: "Voiture", v: viewBooking.carName },
                { l: "Départ", v: `${viewBooking.startDate} à ${viewBooking.startTime}` },
                { l: "Retour prévu", v: `${viewBooking.endDate} à ${viewBooking.endTime}` },
                { l: "Villes", v: `${viewBooking.villeDepart} → ${viewBooking.villeRetour}` },
                { l: "Montant", v: `${(viewBooking.finalPrice ?? viewBooking.totalPrice).toLocaleString()} MAD` },
              ].map((row) => (
                <div key={row.l} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{row.l}</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%]">{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Statut</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[viewBooking.status as BookingStatus]?.bg} ${STATUS_CONFIG[viewBooking.status as BookingStatus]?.color}`}>
                  {STATUS_CONFIG[viewBooking.status as BookingStatus]?.label}
                </span>
              </div>
              {viewBooking.returnInspection && (
                <div className="mt-2 p-3 bg-orange-50 rounded-xl">
                  <p className="text-xs font-bold text-orange-700 mb-1">Rapport de retour</p>
                  <p className="text-xs">Frais supplémentaires : <span className="font-bold text-red-600">{viewBooking.returnInspection.totalExtraFees.toLocaleString()} MAD</span></p>
                  <p className="text-xs">Montant final : <span className="font-bold text-green-700">{viewBooking.returnInspection.finalPrice.toLocaleString()} MAD</span></p>
                </div>
              )}
            </div>
            <button onClick={() => setViewBooking(null)} className="mt-5 w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 cursor-pointer whitespace-nowrap">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
