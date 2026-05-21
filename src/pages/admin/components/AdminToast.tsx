import { useEffect, useState } from "react";
import type { Notification } from "@/mocks/bookings";

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  booking: {
    icon: "ri-calendar-check-line",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-300",
  },
  default: {
    icon: "ri-notification-3-line",
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-300",
  },
};

function getCfg(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

interface SingleToastProps {
  notif: Notification;
  onDismiss: (id: string) => void;
  onView: () => void;
}

function SingleToast({ notif, onDismiss, onView }: SingleToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notif.id), 350);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notif.id, onDismiss]);

  const cfg = getCfg(notif.type);
  const isBooking = notif.type === "booking";

  return (
    <div
      className={`flex items-start gap-3 w-full bg-white border ${cfg.border} rounded-2xl p-4 transition-all duration-300 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${cfg.bg}`}>
        <i className={`${cfg.icon} ${cfg.color} text-lg`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-gray-800 leading-tight">{notif.title}</p>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => onDismiss(notif.id), 350);
            }}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer flex-shrink-0 mt-0.5"
          >
            <i className="ri-close-line text-gray-400 text-sm" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
        <div className="flex items-center gap-2 mt-2">
          {isBooking && (
            <button
              onClick={() => {
                onView();
                onDismiss(notif.id);
              }}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap transition-colors"
            >
              Voir les réservations
            </button>
          )}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => onDismiss(notif.id), 350);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer whitespace-nowrap"
          >
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminToastContainerProps {
  toasts: Notification[];
  onDismiss: (id: string) => void;
  onViewBookings: () => void;
}

export function AdminToastContainer({
  toasts,
  onDismiss,
  onViewBookings,
}: AdminToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast notif={t} onDismiss={onDismiss} onView={onViewBookings} />
        </div>
      ))}
    </div>
  );
}
