import { useRef, useEffect } from "react";
import type { Notification } from "@/mocks/bookings";

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  booking:          { icon: "ri-calendar-check-line", color: "text-green-600",  bg: "bg-green-100",  label: "Nouvelle réservation" },
  booking_confirmed:{ icon: "ri-checkbox-circle-line",color: "text-emerald-600",bg: "bg-emerald-100",label: "Confirmée" },
  booking_refused:  { icon: "ri-close-circle-line",   color: "text-red-500",   bg: "bg-red-100",    label: "Refusée" },
  booking_pending:  { icon: "ri-time-line",            color: "text-yellow-600",bg: "bg-yellow-100", label: "En attente" },
  return_done:      { icon: "ri-car-line",             color: "text-sky-600",   bg: "bg-sky-100",    label: "Retour véhicule" },
  review_request:   { icon: "ri-star-line",            color: "text-amber-500", bg: "bg-amber-100",  label: "Avis demandé" },
  promo:            { icon: "ri-price-tag-3-line",     color: "text-orange-500",bg: "bg-orange-100", label: "Promotion" },
  info:             { icon: "ri-information-line",     color: "text-gray-500",  bg: "bg-gray-100",   label: "Info" },
};

function getCfg(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.info;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l\'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function groupNotifications(notifs: Notification[]) {
  const today: Notification[] = [];
  const earlier: Notification[] = [];
  const limit = 24 * 3600 * 1000;
  notifs.forEach((n) => {
    if (Date.now() - new Date(n.createdAt).getTime() < limit) today.push(n);
    else earlier.push(n);
  });
  return { today, earlier };
}

interface AdminNotificationsPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
  onViewBookings: () => void;
}

export function AdminNotificationsPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onClose,
  onViewBookings,
}: AdminNotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { today, earlier } = groupNotifications(notifications);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ri-notification-3-line text-gray-700 text-base" />
          <span className="text-sm font-bold text-gray-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-green-600 hover:text-green-700 font-semibold cursor-pointer whitespace-nowrap">
              Tout lire
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={onClearAll} className="text-xs text-gray-400 hover:text-red-500 font-semibold cursor-pointer whitespace-nowrap">
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
              <i className="ri-notification-off-line text-gray-400 text-xl" />
            </div>
            <p className="text-xs text-gray-400">Aucune notification</p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">Aujourd&apos;hui</p>
                {today.map((n) => (
                  <NotifItem key={n.id} notif={n} onMarkRead={onMarkRead} onViewBookings={onViewBookings} onClose={onClose} />
                ))}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">Plus tôt</p>
                {earlier.map((n) => (
                  <NotifItem key={n.id} notif={n} onMarkRead={onMarkRead} onViewBookings={onViewBookings} onClose={onClose} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2.5">
          <button
            onClick={() => { onViewBookings(); onClose(); }}
            className="w-full text-xs text-green-600 hover:text-green-700 font-semibold cursor-pointer py-1 whitespace-nowrap"
          >
            Voir toutes les réservations →
          </button>
        </div>
      )}
    </div>
  );
}

interface NotifItemProps {
  notif: Notification;
  onMarkRead: (id: string) => void;
  onViewBookings: () => void;
  onClose: () => void;
}

function NotifItem({ notif, onMarkRead, onViewBookings, onClose }: NotifItemProps) {
  const cfg = getCfg(notif.type);

  const handleClick = () => {
    onMarkRead(notif.id);
    if (notif.type === "booking") {
      onViewBookings();
      onClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-none ${!notif.read ? "bg-green-50/40" : ""}`}
    >
      <div className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 ${cfg.bg}`}>
        <i className={`${cfg.icon} ${cfg.color} text-sm`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-xs font-semibold leading-tight ${notif.read ? "text-gray-600" : "text-gray-800"}`}>
              {notif.title}
            </p>
            <span className="text-xs text-gray-300 font-normal px-1.5 py-0.5 bg-gray-100 rounded-full whitespace-nowrap hidden sm:inline">
              {cfg.label}
            </span>
          </div>
          {!notif.read && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
    </div>
  );
}
