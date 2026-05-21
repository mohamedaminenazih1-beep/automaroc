import { useState, useEffect, useCallback, useRef } from "react";
import type { Notification } from "@/mocks/bookings";

/**
 * Gère la file de toasts pour l'admin.
 * Accepte les notifications admin réelles depuis le BookingContext.
 * Affiche les nouvelles notifications non lues comme toasts.
 * AUCUNE simulation — uniquement les vraies réservations.
 */
export function useAdminNotifications(adminNotifications: Notification[]) {
  const [toastQueue, setToastQueue] = useState<Notification[]>([]);
  const shownRef = useRef<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Au premier rendu, on enregistre les notifications existantes sans les montrer comme toasts
    if (isFirstRender.current) {
      adminNotifications.forEach((n) => shownRef.current.add(n.id));
      isFirstRender.current = false;
      return;
    }

    // Pour les nouvelles notifications non lues, les afficher comme toasts
    const fresh = adminNotifications.filter(
      (n) => !n.read && !shownRef.current.has(n.id)
    );
    if (fresh.length === 0) return;

    fresh.forEach((n) => shownRef.current.add(n.id));
    setToastQueue((prev) => [...prev, ...fresh]);
  }, [adminNotifications]);

  const dismissToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toastQueue, dismissToast };
}
