import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem, BookingItem, Notification, Review } from "@/mocks/bookings";
import {
  mockInitialBookings,
  mockAdminExtraBookings,
  mockInitialNotifications,
  mockInitialReviews,
} from "@/mocks/bookings";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

interface CarAvailability {
  [carId: string]: boolean;
}

const INITIAL_AVAILABILITY: CarAvailability = {
  "1": true, "2": true, "3": true, "4": false,
  "5": true, "6": true, "7": true, "8": false,
};

// ── Refuse reasons with solutions ─────────────────────────────────────────
export const REFUSE_REASONS: { value: string; label: string; solution: string; canFix: boolean }[] = [
  {
    value: "overlap",
    label: "Chevauchement de dates",
    solution: "Veuillez choisir d'autres dates libres pour ce véhicule. Consultez le calendrier de disponibilité et soumettez une nouvelle demande.",
    canFix: true,
  },
  {
    value: "car_unavailable",
    label: "Voiture temporairement indisponible",
    solution: "Le véhicule choisi est temporairement en maintenance. Veuillez sélectionner un autre véhicule disponible dans notre catalogue.",
    canFix: true,
  },
  {
    value: "client_suspended",
    label: "Compte client suspendu",
    solution: "Votre compte présente une restriction. Contactez notre service client au +212 5XX XXX XXX pour régulariser votre situation. Délai: 2-5 jours ouvrables.",
    canFix: false,
  },
  {
    value: "dates_invalid",
    label: "Dates de réservation invalides",
    solution: "Veuillez choisir une date de début future et une durée minimale d'1 jour. Assurez-vous que la date de retour est postérieure à la date de départ.",
    canFix: true,
  },
  {
    value: "permis_expired",
    label: "Permis de conduire expiré ou invalide",
    solution: "Votre permis de conduire est expiré. Renouvelez votre permis auprès de l'administration compétente, puis mettez à jour votre profil. Délai: selon les délais administratifs.",
    canFix: false,
  },
  {
    value: "manual",
    label: "Autre raison",
    solution: "Contactez notre service client pour plus d'informations et pour trouver une solution adaptée à votre situation.",
    canFix: true,
  },
];

interface BookingContextValue {
  // State
  allBookings: BookingItem[];
  cart: CartItem[];
  notifications: Notification[];
  reviews: Review[];
  carAvailability: CarAvailability;

  // Computed
  unreadCount: number;
  userBookings: (userId: string) => BookingItem[];
  userNotifications: (userId: string) => Notification[];

  // Client actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (carId: string) => void;
  clearCart: () => void;
  submitBooking: (item: CartItem, clientData: {
    userId: string;
    clientNom: string;
    clientPrenom: string;
    clientEmail: string;
    clientPhone: string;
    clientCIN: string;
    clientNumPermis: string;
    clientDateExpirationPermis: string;
    clientStatus: "active" | "suspended";
  }) => BookingItem;
  cancelBooking: (bookingId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  addWelcomeNotification: (userId: string, userName: string) => void;
  addNotification: (notif: Omit<Notification, "id" | "createdAt" | "read">) => void;
  submitReview: (review: Omit<Review, "id" | "createdAt">) => void;

  // Admin actions
  adminAcceptBooking: (bookingId: string) => void;
  adminRefuseBooking: (bookingId: string, reasonValue: string, customNote?: string) => void;
  adminMarkPaymentReceived: (bookingId: string) => void;
  adminUpdateBookingStatus: (bookingId: string, status: BookingItem["status"]) => void;
  adminDeleteBooking: (bookingId: string) => void;

  // Manager actions
  managerConfirmRemise: (bookingId: string) => void;
  managerConfirmRetour: (bookingId: string, inspection: BookingItem["returnInspection"]) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const STORAGE_KEY = "automaroc_bookings_v2";
const NOTIF_KEY = "automaroc_notifications_v2";

function loadBookings(): BookingItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as BookingItem[];
  } catch { /* ignore */ }
  return [...mockInitialBookings, ...mockAdminExtraBookings];
}

function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) return JSON.parse(stored) as Notification[];
  } catch { /* ignore */ }
  return mockInitialNotifications;
}

function computeAvailability(bookings: BookingItem[], base: CarAvailability): CarAvailability {
  const result = { ...base };
  const today = new Date().toISOString().split("T")[0];
  bookings.forEach((b) => {
    if (b.status === "confirmed" || b.status === "active") {
      if (b.startDate <= today && b.endDate >= today) {
        result[b.carId] = false;
      }
    }
    if (b.status === "completed" || b.status === "cancelled" || b.status === "refused") {
      // Don't force available — let base decide unless something else blocks it
    }
  });
  return result;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState<BookingItem[]>(loadBookings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [reviews, setReviews] = useState<Review[]>(mockInitialReviews);
  const [carAvailability, setCarAvailability] = useState<CarAvailability>(() =>
    computeAvailability([], INITIAL_AVAILABILITY)
  );

  useEffect(() => {
    api.bookings.getAll().then((data) => {
      setAllBookings(data);
      setCarAvailability(computeAvailability(data, INITIAL_AVAILABILITY));
    }).catch(console.error);
  }, []);

  // Persist bookings locally just in case, but rely on API mostly
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookings));
    setCarAvailability(computeAvailability(allBookings, INITIAL_AVAILABILITY));
  }, [allBookings]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Reset cart when user changes
  useEffect(() => {
    if (user?.id) {
      const savedCart = localStorage.getItem(`automaroc_cart_${user.id}`);
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch { setCart([]); }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user?.id]);

  // Persist cart per user
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`automaroc_cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user?.id]);

  const unreadCount = notifications.filter((n) => n.userId === user?.id && !n.read).length;

  const userBookings = useCallback((userId: string) =>
    allBookings.filter((b) => b.userId === userId), [allBookings]);

  const userNotifications = useCallback((userId: string) =>
    notifications.filter((n) => n.userId === userId), [notifications]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.carId === item.carId);
      return exists ? prev.map((c) => c.carId === item.carId ? item : c) : [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((carId: string) => {
    setCart((prev) => prev.filter((c) => c.carId !== carId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const submitBooking = useCallback(async (item: CartItem, clientData: {
    userId: string;
    clientNom: string;
    clientPrenom: string;
    clientEmail: string;
    clientPhone: string;
    clientCIN: string;
    clientNumPermis: string;
    clientDateExpirationPermis: string;
    clientStatus: "active" | "suspended";
  }) => {
    const newBooking: BookingItem = {
      ...item,
      id: `B${Date.now()}`,
      userId: clientData.userId,
      status: "pending",
      paymentMethod: "cash_on_delivery",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      city: item.city,
      clientNom: clientData.clientNom,
      clientPrenom: clientData.clientPrenom,
      clientEmail: clientData.clientEmail,
      clientPhone: clientData.clientPhone,
      clientCIN: clientData.clientCIN,
      clientNumPermis: clientData.clientNumPermis,
      clientDateExpirationPermis: clientData.clientDateExpirationPermis,
      clientStatus: clientData.clientStatus,
    };
    
    try {
      await api.bookings.create(newBooking);
      setAllBookings((prev) => [newBooking, ...prev]);
      setCart((prev) => prev.filter((c) => c.carId !== item.carId));
    } catch (e) {
      console.error(e);
      return newBooking;
    }

    // Notify user: pending
    const userNotif: Notification = {
      id: `N${Date.now()}`,
      userId: clientData.userId,
      type: "booking_pending",
      title: "Demande de réservation envoyée",
      message: `Votre demande pour ${item.carName} du ${item.startDate} au ${item.endDate} est en attente de validation par l'administration. Vous recevrez une réponse sous peu.`,
      read: false,
      createdAt: new Date().toISOString(),
      bookingId: newBooking.id,
    };
    // Notify admin
    const adminNotif: Notification = {
      id: `NA${Date.now()}`,
      userId: "admin",
      type: "booking",
      title: `Nouvelle réservation — ${clientData.clientPrenom} ${clientData.clientNom}`,
      message: `${clientData.clientPrenom} ${clientData.clientNom} demande ${item.carName} du ${item.startDate} au ${item.endDate} — ${item.totalPrice} MAD`,
      read: false,
      createdAt: new Date().toISOString(),
      bookingId: newBooking.id,
    };
    setNotifications((prev) => [adminNotif, userNotif, ...prev]);
    return newBooking;
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    await api.bookings.update(bookingId, { status: "cancelled" }).catch(console.error);
    setAllBookings((prev) =>
      prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" as const } : b)
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback((userId: string) => {
    setNotifications((prev) => prev.map((n) => n.userId === userId ? { ...n, read: true } : n));
  }, []);

  const addWelcomeNotification = useCallback((userId: string, userName: string) => {
    const notif: Notification = {
      id: `NW${Date.now()}`,
      userId,
      type: "info",
      title: `Bienvenue chez AutoMaroc, ${userName} !`,
      message: "Votre compte a été créé avec succès. Découvrez notre flotte de véhicules et réservez dès maintenant votre voiture idéale.",
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [{
      ...notif,
      id: `N${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const submitReview = useCallback((review: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...review,
      id: `R${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setAllBookings((prev) =>
      prev.map((b) => b.id === review.bookingId ? { ...b, reviewLeft: true } : b)
    );
  }, []);

  // ── Admin actions ────────────────────────────────────────────────────────

  const adminAcceptBooking = useCallback(async (bookingId: string) => {
    await api.bookings.update(bookingId, { status: "confirmed", voucherGenerated: true }).catch(console.error);
    setAllBookings((prev) => {
      const booking = prev.find((b) => b.id === bookingId);
      if (!booking) return prev;
      const updated = prev.map((b) => b.id === bookingId
        ? { ...b, status: "confirmed" as const, voucherGenerated: true }
        : b
      );
      // Notify user
      setNotifications((ns) => [{
        id: `NA${Date.now()}`,
        userId: booking.userId,
        type: "booking_confirmed" as const,
        title: "Réservation acceptée !",
        message: `Bonne nouvelle ! Votre réservation de la ${booking.carName} du ${booking.startDate} à ${booking.startTime} au ${booking.endDate} à ${booking.endTime} a été confirmée. Votre bon de réservation est disponible dans votre historique.`,
        read: false,
        createdAt: new Date().toISOString(),
        bookingId,
      }, ...ns]);
      return updated;
    });
  }, []);

  const adminRefuseBooking = useCallback(async (bookingId: string, reasonValue: string, customNote?: string) => {
    const reasonObj = REFUSE_REASONS.find((r) => r.value === reasonValue);
    const reasonLabel = reasonValue === "manual" && customNote ? customNote : (reasonObj?.label || "Refus");
    const solution = reasonObj?.solution || "Contactez notre service client.";

    await api.bookings.update(bookingId, { status: "refused", refuseReason: reasonLabel, refuseSolution: solution }).catch(console.error);

    setAllBookings((prev) => {
      const booking = prev.find((b) => b.id === bookingId);
      if (!booking) return prev;
      const updated = prev.map((b) => b.id === bookingId
        ? { ...b, status: "refused" as const, refuseReason: reasonLabel, refuseSolution: solution }
        : b
      );
      const solutionText = reasonValue === "manual" ? solution : `Solution : ${solution}`;
      setNotifications((ns) => [{
        id: `NR${Date.now()}`,
        userId: booking.userId,
        type: "booking_refused" as const,
        title: "Réservation refusée",
        message: `Votre demande pour ${booking.carName} du ${booking.startDate} au ${booking.endDate} a été refusée. Motif : ${reasonLabel}. ${solutionText}`,
        read: false,
        createdAt: new Date().toISOString(),
        bookingId,
        refuseReason: reasonLabel,
        refuseSolution: solution,
      }, ...ns]);
      return updated;
    });
  }, []);

  const adminMarkPaymentReceived = useCallback(async (bookingId: string) => {
    await api.bookings.update(bookingId, { paymentStatus: "paid" }).catch(console.error);
    setAllBookings((prev) =>
      prev.map((b) => b.id === bookingId ? { ...b, paymentStatus: "paid" as const } : b)
    );
  }, []);

  const adminUpdateBookingStatus = useCallback(async (bookingId: string, status: BookingItem["status"]) => {
    await api.bookings.update(bookingId, { status }).catch(console.error);
    setAllBookings((prev) =>
      prev.map((b) => b.id === bookingId ? { ...b, status } : b)
    );
  }, []);

  const adminDeleteBooking = useCallback(async (bookingId: string) => {
    await api.bookings.delete(bookingId).catch(console.error);
    setAllBookings((prev) => prev.filter((b) => b.id !== bookingId));
  }, []);

  // ── Manager actions ──────────────────────────────────────────────────────

  const managerConfirmRemise = useCallback((bookingId: string) => {
    setAllBookings((prev) =>
      prev.map((b) => b.id === bookingId
        ? { ...b, status: "active" as const, remiseConfirmed: true }
        : b
      )
    );
  }, []);

  const managerConfirmRetour = useCallback((bookingId: string, inspection: BookingItem["returnInspection"]) => {
    setAllBookings((prev) => {
      const booking = prev.find((b) => b.id === bookingId);
      if (!booking) return prev;
      const finalPrice = inspection?.finalPrice ?? booking.totalPrice;
      const updated = prev.map((b) => b.id === bookingId
        ? { ...b, status: "completed" as const, retourConfirmed: true, returnInspection: inspection, finalPrice }
        : b
      );
      const hasExtras = inspection && inspection.totalExtraFees > 0;
      const msg = hasExtras
        ? `Votre ${booking.carName} a été restituée. Des frais supplémentaires de ${inspection!.totalExtraFees.toLocaleString()} MAD ont été appliqués (voir détails). Montant final : ${finalPrice.toLocaleString()} MAD.`
        : `Votre ${booking.carName} a été restituée avec succès. Aucun frais supplémentaire. Merci de votre confiance !`;
      setNotifications((ns) => [
        {
          id: `NRet${Date.now()}`,
          userId: booking.userId,
          type: "return_done" as const,
          title: hasExtras ? "Retour validé — frais supplémentaires" : "Retour validé avec succès",
          message: msg,
          read: false,
          createdAt: new Date().toISOString(),
          bookingId,
        },
        {
          id: `NRev${Date.now() + 1}`,
          userId: booking.userId,
          type: "review_request" as const,
          title: "Partagez votre expérience",
          message: `Vous avez restitué la ${booking.carName}. Laissez un avis pour aider d'autres clients !`,
          read: false,
          createdAt: new Date().toISOString(),
          bookingId,
        },
        ...ns,
      ]);
      return updated;
    });
  }, []);

  return (
    <BookingContext.Provider value={{
      allBookings,
      cart,
      notifications,
      reviews,
      carAvailability,
      unreadCount,
      userBookings,
      userNotifications,
      addToCart,
      removeFromCart,
      clearCart,
      submitBooking,
      cancelBooking,
      markNotificationRead,
      markAllRead,
      addWelcomeNotification,
      addNotification,
      submitReview,
      adminAcceptBooking,
      adminRefuseBooking,
      adminMarkPaymentReceived,
      adminUpdateBookingStatus,
      adminDeleteBooking,
      managerConfirmRemise,
      managerConfirmRetour,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
