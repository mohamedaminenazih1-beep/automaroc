import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import type { Notification } from "@/mocks/bookings";

const typeConfig: Record<Notification["type"], { icon: string; color: string; bg: string }> = {
  booking:           { icon: "ri-calendar-check-line",   color: "text-green-600",  bg: "bg-green-100" },
  booking_confirmed: { icon: "ri-checkbox-circle-fill",  color: "text-green-600",  bg: "bg-green-100" },
  booking_refused:   { icon: "ri-close-circle-fill",     color: "text-red-500",    bg: "bg-red-100" },
  booking_pending:   { icon: "ri-time-line",             color: "text-yellow-600", bg: "bg-yellow-100" },
  return_done:       { icon: "ri-car-fill",              color: "text-sky-600",    bg: "bg-sky-100" },
  review_request:    { icon: "ri-star-line",             color: "text-amber-500",  bg: "bg-amber-100" },
  promo:             { icon: "ri-gift-line",             color: "text-orange-500", bg: "bg-orange-100" },
  info:              { icon: "ri-information-line",      color: "text-sky-500",    bg: "bg-sky-100" },
  alert:             { icon: "ri-alarm-warning-line",    color: "text-red-500",    bg: "bg-red-100" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l\'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { userNotifications, markNotificationRead, markAllRead, cart, unreadCount } = useBooking();

  if (!isAuthenticated || !user) {
    navigate("/");
    return null;
  }

  const notifications = userNotifications(user.id);
  const myUnread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7fdf7" }}>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/catalogue")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
              <i className="ri-arrow-left-line text-gray-600" />
            </button>
            <Link to="/catalogue" className="flex items-center gap-2">
              <img src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png" alt="AutoMaroc" className="w-6 h-6 object-contain" />
              <span className="text-sm font-bold text-green-700">AutoMaroc</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-shopping-cart-line text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cart.length}</span>
              )}
            </Link>
            <Link to="/history" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-history-line text-gray-600" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="ri-notification-3-line text-green-500" />
            Notifications
            {myUnread > 0 && (
              <span className="ml-1 text-sm font-medium text-gray-400">({myUnread} non lues)</span>
            )}
          </h1>
          {myUnread > 0 && (
            <button onClick={() => markAllRead(user.id)}
              className="text-xs text-green-600 font-semibold hover:text-green-700 cursor-pointer whitespace-nowrap">
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="mb-4 px-4 py-3 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-notification-3-fill text-green-500" />
            </div>
            <p className="text-xs text-green-700">{myUnread} nouvelle{myUnread > 1 ? "s" : ""} notification{myUnread > 1 ? "s" : ""}</p>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
              <i className="ri-notification-off-line text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-500 text-sm">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const t = typeConfig[notif.type] || typeConfig.info;
              return (
                <div key={notif.id} onClick={() => markNotificationRead(notif.id)}
                  className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all hover:border-green-200 ${
                    notif.read ? "border-gray-100 opacity-80" : "border-green-100"
                  }`}>
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${t.bg}`}>
                      <i className={`${t.icon} ${t.color} text-base`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-semibold ${notif.read ? "text-gray-600" : "text-gray-800"}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                      {(notif.type === "booking_refused" && notif.refuseSolution) && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-700">
                            <span className="font-bold">Solution : </span>{notif.refuseSolution}
                          </p>
                        </div>
                      )}
                      {notif.type === "review_request" && notif.bookingId && (
                        <button onClick={(e) => { e.stopPropagation(); navigate("/history"); }}
                          className="mt-2 text-xs text-amber-600 font-semibold hover:text-amber-700 cursor-pointer">
                          Laisser un avis →
                        </button>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
