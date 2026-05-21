import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { api } from "@/services/api";
import { AdminCarsTab } from "./components/AdminCarsTab";
import { AdminBookingsTab } from "./components/AdminBookingsTab";
import { AdminUsersTab } from "./components/AdminUsersTab";
import { AdminNotificationsPanel } from "./components/AdminNotificationsPanel";
import { AdminToastContainer } from "./components/AdminToast";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { AdminCategoriesTab } from "./components/AdminCategoriesTab";

type AdminTab = "dashboard" | "cars" | "bookings" | "users" | "categories";

// ... existing code ...

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const {
    notifications: allNotifications,
    markNotificationRead,
    markAllRead: markAllReadCtx,
    allBookings,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (role !== "admin") navigate("/");
    else {
      api.cars.getAll().then(setCars).catch(console.error);
      api.users.getAll().then(setUsers).catch(console.error);
    }
  }, [role, navigate]);

  // Filtrer uniquement les notifications admin (vraies réservations)
  const adminNotifications = allNotifications.filter((n) => n.userId === "admin");
  const unreadCount = adminNotifications.filter((n) => !n.read).length;

  // Toast manager — uniquement les nouvelles notifications réelles
  const { toastQueue, dismissToast } = useAdminNotifications(adminNotifications);

  const pendingCount = allBookings.filter((b) => b.status === "pending").length;



  const handleLogout = () => { logout(); navigate("/"); };

  if (!user || role !== "admin") return null;

  const navItems: { id: AdminTab; icon: string; label: string; badge?: number }[] = [
    { id: "dashboard",  icon: "ri-dashboard-line",       label: "Tableau de bord" },
    { id: "cars",       icon: "ri-car-line",             label: "Voitures",        badge: cars.filter((c) => !c.available).length },
    { id: "bookings",   icon: "ri-calendar-check-line",  label: "Réservations",    badge: pendingCount },
    { id: "users",      icon: "ri-team-line",            label: "Utilisateurs" },
    { id: "categories", icon: "ri-price-tag-3-line",     label: "Catégories" },
  ];

  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.available).length;
  const availablePct = totalCars > 0 ? Math.round((availableCars / totalCars) * 100) : 0;
  const totalClients = users.filter(u => u.role === "client").length;
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f7fdf7" }}>
      {/* Toast container — vraies notifications en temps réel */}
      <AdminToastContainer
        toasts={toastQueue}
        onDismiss={dismissToast}
        onViewBookings={() => setActiveTab("bookings")}
      />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col flex-shrink-0`} style={{ minHeight: "100vh" }}>
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3 overflow-hidden">
          <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-xl flex-shrink-0">
            <i className="ri-car-fill text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-sm font-bold text-green-700 whitespace-nowrap">AutoMaroc Admin</span>}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === item.id ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"}`}>
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

        <div className="px-2 pb-4 border-t border-gray-100 pt-3 space-y-1">
          {sidebarOpen && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-red-500 font-medium">Administrateur</p>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-logout-box-line text-base" />
            </div>
            {sidebarOpen && "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen((p) => !p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-menu-line text-gray-600 text-lg" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800">{navItems.find((n) => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-gray-400">AutoMaroc — Panneau d&apos;administration</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Cloche de notification */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((p) => !p)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <i className={`ri-notification-3-line text-gray-600 text-lg transition-transform ${unreadCount > 0 ? "animate-bounce" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5" style={{ fontSize: "9px" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <AdminNotificationsPanel
                  notifications={adminNotifications}
                  unreadCount={unreadCount}
                  onMarkRead={markNotificationRead}
                  onMarkAllRead={() => markAllReadCtx("admin")}
                  onClearAll={() => markAllReadCtx("admin")}
                  onClose={() => setNotifOpen(false)}
                  onViewBookings={() => { setActiveTab("bookings"); setNotifOpen(false); }}
                />
              )}
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full">
              <i className="ri-shield-user-line text-red-600 text-sm" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline whitespace-nowrap">{user.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Voitures", value: totalCars, icon: "ri-car-fill", color: "text-green-600", bg: "bg-green-50", sub: `${availableCars} dispos` },
                  { label: "Disponibles", value: availableCars, icon: "ri-checkbox-circle-line", color: "text-emerald-600", bg: "bg-emerald-50", sub: `${availablePct}% du parc` },
                  { label: "Réservations", value: allBookings.length, icon: "ri-calendar-fill", color: "text-orange-500", bg: "bg-orange-50", sub: "total" },
                  { label: "En attente", value: pendingCount, icon: "ri-time-line", color: "text-yellow-600", bg: "bg-yellow-50", sub: "à traiter" },
                  { label: "Clients", value: totalClients, icon: "ri-team-fill", color: "text-green-600", bg: "bg-green-50", sub: "+8 ce mois" },
                  { label: "Revenus MAD", value: totalRevenue.toLocaleString(), icon: "ri-money-cny-circle-fill", color: "text-green-700", bg: "bg-green-50", sub: "ce mois" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                      <i className={`${stat.icon} ${stat.color} text-lg`} />
                    </div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Réservations récentes */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800">Réservations récentes</h2>
                  <button onClick={() => setActiveTab("bookings")} className="text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer whitespace-nowrap">Tout voir →</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {allBookings.slice(0, 5).map((b) => {
                    const STATUS_COLOR: Record<string, string> = {
                      active: "bg-orange-50 text-orange-700",
                      completed: "bg-gray-100 text-gray-600",
                      pending: "bg-yellow-50 text-yellow-700",
                      cancelled: "bg-red-50 text-red-600",
                      confirmed: "bg-green-50 text-green-700",
                      refused: "bg-red-100 text-red-700",
                    };
                    const STATUS_LABEL: Record<string, string> = {
                      active: "En cours", completed: "Terminée", pending: "En attente",
                      cancelled: "Annulée", confirmed: "Confirmée", refused: "Refusée",
                    };
                    return (
                      <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setActiveTab("bookings")}>
                        <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full flex-shrink-0">
                          <i className="ri-user-line text-green-600 text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{b.clientPrenom} {b.clientNom}</p>
                          <p className="text-xs text-gray-400 truncate">{b.carName} · {b.villeDepart}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-green-700">{b.totalPrice.toLocaleString()} MAD</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[b.status] || b.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notifications récentes */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-800">Activité récente</h2>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <button onClick={() => setNotifOpen(true)} className="text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer whitespace-nowrap">
                    Tout voir →
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {adminNotifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">Aucune notification</div>
                  ) : (
                    adminNotifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { markNotificationRead(n.id); if (n.type === "booking") setActiveTab("bookings"); }}
                        className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-green-50/30" : ""}`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-green-50 rounded-full flex-shrink-0">
                          <i className="ri-calendar-check-line text-green-600 text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${n.read ? "text-gray-600" : "text-gray-800"}`}>{n.title}</p>
                          <p className="text-xs text-gray-400 truncate">{n.message}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Fleet status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-800">État du parc automobile</h2>
                  <button onClick={() => setActiveTab("cars")} className="text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer whitespace-nowrap">Gérer le parc →</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total", val: totalCars, icon: "ri-car-fill", color: "text-gray-700", bg: "bg-gray-50" },
                    { label: "Disponibles", val: availableCars, icon: "ri-checkbox-circle-fill", color: "text-green-600", bg: "bg-green-50" },
                    { label: "En location", val: totalCars - availableCars, icon: "ri-steering-2-line", color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Taux dispo", val: `${availablePct}%`, icon: "ri-pie-chart-2-line", color: "text-green-700", bg: "bg-green-50" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <i className={`${s.icon} ${s.color} text-xl`} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Disponibles ({availableCars})</span>
                    <span>En location ({totalCars - availableCars})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${availablePct}%` }} />
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "cars" && <AdminCarsTab />}
          {activeTab === "bookings" && <AdminBookingsTab />}
          {activeTab === "users" && <AdminUsersTab />}
          {activeTab === "categories" && <AdminCategoriesTab />}
        </main>
      </div>
    </div>
  );
}
