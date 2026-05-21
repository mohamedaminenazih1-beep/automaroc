export interface ReturnInspection {
  returnDate: string;
  isLate: boolean;
  lateDays: number;
  lateFees: number;
  fuelLevel: "full" | "3/4" | "1/2" | "1/4" | "empty";
  fuelFees: number;
  exteriorCondition: "excellent" | "good" | "fair" | "damaged";
  interiorCondition: "excellent" | "good" | "fair" | "dirty";
  damages: { description: string; cost: number }[];
  damageFees: number;
  totalExtraFees: number;
  basePrice: number;
  finalPrice: number;
  notes: string;
}

export interface BookingItem {
  id: string;
  userId: string;
  carId: string;
  carName: string;
  carBrand: string;
  carImage: string;
  pricePerDay: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  villeDepart: string;
  villeRetour: string;
  days: number;
  totalPrice: number;
  city: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled" | "refused";
  paymentMethod: "cash_on_delivery";
  paymentStatus: "pending" | "paid";
  createdAt: string;
  // Client snapshot at booking time
  clientNom: string;
  clientPrenom: string;
  clientEmail: string;
  clientPhone: string;
  clientCIN: string;
  clientNumPermis: string;
  clientDateExpirationPermis: string;
  clientStatus: "active" | "suspended";
  // Admin fields
  refuseReason?: string;
  refuseSolution?: string;
  // Manager fields
  remiseConfirmed?: boolean;
  retourConfirmed?: boolean;
  returnInspection?: ReturnInspection;
  finalPrice?: number;
  reviewLeft?: boolean;
  voucherGenerated?: boolean;
}

export interface CartItem {
  carId: string;
  carName: string;
  carBrand: string;
  carImage: string;
  pricePerDay: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  villeDepart: string;
  villeRetour: string;
  days: number;
  totalPrice: number;
  city: string;
}

export interface Notification {
  id: string;
  userId: string; // "admin" for admin notifications, user id for user
  type: "booking" | "promo" | "info" | "alert" | "booking_confirmed" | "booking_refused" | "booking_pending" | "return_done" | "review_request";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  bookingId?: string;
  refuseReason?: string;
  refuseSolution?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  carId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Initial bookings for demo (client-001)
export const mockInitialBookings: BookingItem[] = [
  {
    id: "B001",
    userId: "client-001",
    carId: "3",
    carName: "Hyundai Tucson",
    carBrand: "Hyundai",
    carImage: "https://readdy.ai/api/search-image?query=Hyundai%20Tucson%20silver%20SUV%20clean%20minimal%20light%20background%20professional%20automotive%20photography%20modern%20crossover%202023%20rental&width=400&height=280&seq=ecar3&orientation=landscape",
    pricePerDay: 550,
    startDate: "2026-04-05",
    startTime: "09:00",
    endDate: "2026-04-10",
    endTime: "18:00",
    villeDepart: "Marrakech",
    villeRetour: "Marrakech",
    days: 5,
    totalPrice: 2750,
    city: "Marrakech",
    status: "completed",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "paid",
    createdAt: "2026-04-03T10:30:00Z",
    clientNom: "Alaoui",
    clientPrenom: "Youssef",
    clientEmail: "client@automaroc.ma",
    clientPhone: "+212 663 000 003",
    clientCIN: "Y654321",
    clientNumPermis: "MA-CLI-001",
    clientDateExpirationPermis: "2027-11-10",
    clientStatus: "active",
    remiseConfirmed: true,
    retourConfirmed: true,
    reviewLeft: false,
    voucherGenerated: true,
  },
  {
    id: "B002",
    userId: "client-001",
    carId: "1",
    carName: "Dacia Logan",
    carBrand: "Dacia",
    carImage: "https://readdy.ai/api/search-image?query=Dacia%20Logan%20white%20car%20clean%20minimal%20light%20grey%20background%20professional%20automotive%20photography%20modern%20compact%20sedan%20Morocco%20rental&width=400&height=280&seq=ecar1&orientation=landscape",
    pricePerDay: 250,
    startDate: "2026-04-22",
    startTime: "08:00",
    endDate: "2026-04-25",
    endTime: "17:00",
    villeDepart: "Casablanca",
    villeRetour: "Casablanca",
    days: 3,
    totalPrice: 750,
    city: "Casablanca",
    status: "confirmed",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    createdAt: "2026-04-14T14:00:00Z",
    clientNom: "Alaoui",
    clientPrenom: "Youssef",
    clientEmail: "client@automaroc.ma",
    clientPhone: "+212 663 000 003",
    clientCIN: "Y654321",
    clientNumPermis: "MA-CLI-001",
    clientDateExpirationPermis: "2027-11-10",
    clientStatus: "active",
    voucherGenerated: true,
  },
];

// Admin-visible bookings (other clients)
export const mockAdminExtraBookings: BookingItem[] = [
  {
    id: "B005",
    userId: "client-ext-001",
    carId: "7",
    carName: "Mercedes Classe C",
    carBrand: "Mercedes",
    carImage: "https://readdy.ai/api/search-image?query=Mercedes%20C%20Class%20silver%20luxury%20sedan%20clean%20minimal%20white%20background%20professional%20automotive%20photography%20elegant%20premium%20rental%20Morocco&width=400&height=280&seq=ecar7&orientation=landscape",
    pricePerDay: 950,
    startDate: "2026-04-22",
    startTime: "10:00",
    endDate: "2026-04-25",
    endTime: "18:00",
    villeDepart: "Marrakech",
    villeRetour: "Marrakech",
    days: 3,
    totalPrice: 2850,
    city: "Marrakech",
    status: "pending",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    createdAt: "2026-04-18T08:20:00Z",
    clientNom: "Berrada",
    clientPrenom: "Omar",
    clientEmail: "omar.berrada@gmail.com",
    clientPhone: "+212 661 234 567",
    clientCIN: "BB112233",
    clientNumPermis: "C-123456",
    clientDateExpirationPermis: "2028-06-15",
    clientStatus: "active",
  },
  {
    id: "B006",
    userId: "client-ext-002",
    carId: "6",
    carName: "Volkswagen Tiguan",
    carBrand: "Volkswagen",
    carImage: "https://readdy.ai/api/search-image?query=Volkswagen%20Tiguan%20grey%20SUV%20premium%20clean%20minimal%20studio%20background%20professional%20automotive%20photography%20modern%20elegant%20rental%20Morocco&width=400&height=280&seq=ecar6&orientation=landscape",
    pricePerDay: 680,
    startDate: "2026-04-12",
    startTime: "09:00",
    endDate: "2026-04-15",
    endTime: "18:00",
    villeDepart: "Casablanca",
    villeRetour: "Casablanca",
    days: 3,
    totalPrice: 2040,
    city: "Casablanca",
    status: "completed",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "paid",
    createdAt: "2026-04-10T11:00:00Z",
    clientNom: "Amrani",
    clientPrenom: "Zineb",
    clientEmail: "zineb.amrani@gmail.com",
    clientPhone: "+212 662 345 678",
    clientCIN: "ZA445566",
    clientNumPermis: "C-789012",
    clientDateExpirationPermis: "2029-01-20",
    clientStatus: "active",
    remiseConfirmed: true,
    retourConfirmed: true,
    voucherGenerated: true,
  },
  {
    id: "B007",
    userId: "client-ext-003",
    carId: "5",
    carName: "Peugeot 208",
    carBrand: "Peugeot",
    carImage: "https://readdy.ai/api/search-image?query=Peugeot%20208%20blue%20compact%20hatchback%20clean%20studio%20white%20background%20professional%20car%20photography%20modern%202023%20Morocco%20rental&width=400&height=280&seq=ecar5&orientation=landscape",
    pricePerDay: 300,
    startDate: "2026-04-25",
    startTime: "08:00",
    endDate: "2026-04-29",
    endTime: "17:00",
    villeDepart: "Tanger",
    villeRetour: "Tanger",
    days: 4,
    totalPrice: 1200,
    city: "Tanger",
    status: "pending",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    createdAt: "2026-04-17T16:00:00Z",
    clientNom: "Regragui",
    clientPrenom: "Hassan",
    clientEmail: "hassan.regragui@gmail.com",
    clientPhone: "+212 663 456 789",
    clientCIN: "HR778899",
    clientNumPermis: "C-345678",
    clientDateExpirationPermis: "2027-03-10",
    clientStatus: "suspended",
  },
  {
    id: "B009",
    userId: "client-ext-005",
    carId: "3",
    carName: "Hyundai Tucson",
    carBrand: "Hyundai",
    carImage: "https://readdy.ai/api/search-image?query=Hyundai%20Tucson%20silver%20SUV%20clean%20minimal%20light%20background%20professional%20automotive%20photography%20modern%20crossover%202023%20rental&width=400&height=280&seq=ecar3&orientation=landscape",
    pricePerDay: 550,
    startDate: "2026-05-01",
    startTime: "09:00",
    endDate: "2026-05-05",
    endTime: "18:00",
    villeDepart: "Marrakech",
    villeRetour: "Marrakech",
    days: 4,
    totalPrice: 2200,
    city: "Marrakech",
    status: "pending",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    createdAt: "2026-04-17T17:30:00Z",
    clientNom: "Benmoussa",
    clientPrenom: "Rachid",
    clientEmail: "rachid.benmoussa@gmail.com",
    clientPhone: "+212 665 678 901",
    clientCIN: "RB556677",
    clientNumPermis: "C-901234",
    clientDateExpirationPermis: "2028-09-05",
    clientStatus: "active",
  },
  {
    id: "B010",
    userId: "client-ext-006",
    carId: "7",
    carName: "Mercedes Classe C",
    carBrand: "Mercedes",
    carImage: "https://readdy.ai/api/search-image?query=Mercedes%20C%20Class%20silver%20luxury%20sedan%20clean%20minimal%20white%20background%20professional%20automotive%20photography%20elegant%20premium%20rental%20Morocco&width=400&height=280&seq=ecar7&orientation=landscape",
    pricePerDay: 950,
    startDate: "2026-04-19",
    startTime: "10:00",
    endDate: "2026-04-22",
    endTime: "18:00",
    villeDepart: "Casablanca",
    villeRetour: "Rabat",
    days: 3,
    totalPrice: 2850,
    city: "Marrakech",
    status: "active",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    createdAt: "2026-04-15T09:00:00Z",
    clientNom: "Cherkaoui",
    clientPrenom: "Fatima",
    clientEmail: "fatima.cherkaoui@gmail.com",
    clientPhone: "+212 666 789 012",
    clientCIN: "FC334455",
    clientNumPermis: "C-567890",
    clientDateExpirationPermis: "2030-02-28",
    clientStatus: "active",
    remiseConfirmed: true,
    retourConfirmed: false,
    voucherGenerated: true,
  },
];

export const mockInitialNotifications: Notification[] = [
  {
    id: "N001",
    userId: "client-001",
    type: "booking_confirmed",
    title: "Réservation confirmée",
    message: "Votre Dacia Logan du 22 au 25 avril a été confirmée par l'administration. Votre bon de réservation est prêt.",
    read: false,
    createdAt: "2026-04-14T14:05:00Z",
    bookingId: "B002",
  },
  {
    id: "N002",
    userId: "client-001",
    type: "promo",
    title: "Offre spéciale -20%",
    message: "Ce week-end, bénéficiez de 20% de réduction sur les SUV disponibles à Marrakech !",
    read: false,
    createdAt: "2026-04-13T09:00:00Z",
  },
  {
    id: "N003",
    userId: "client-001",
    type: "info",
    title: "Bienvenue sur AutoMaroc",
    message: "Découvrez notre flotte de plus de 48 véhicules disponibles partout au Maroc.",
    read: true,
    createdAt: "2026-04-01T08:00:00Z",
  },
];

export const mockInitialReviews: Review[] = [
  { id: "R001", bookingId: "B001", userId: "client-001", userName: "Youssef A.", carId: "3", rating: 5, comment: "Excellent véhicule, très propre et confortable. Service impeccable, je recommande vivement AutoMaroc !", createdAt: "2026-04-11T10:00:00Z" },
  { id: "R002", bookingId: "B-ext-1", userId: "client-ext-a", userName: "Leila M.", carId: "7", rating: 5, comment: "La Mercedes était parfaite pour notre voyage. Aucun problème, livraison ponctuelle.", createdAt: "2026-04-10T12:00:00Z" },
  { id: "R003", bookingId: "B-ext-2", userId: "client-ext-b", userName: "Karim B.", carId: "3", rating: 4, comment: "Très bonne expérience, Tucson spacieux et économique. Je reviendrai sans hésitation.", createdAt: "2026-04-09T09:00:00Z" },
  { id: "R004", bookingId: "B-ext-3", userId: "client-ext-c", userName: "Sara T.", carId: "6", rating: 5, comment: "Volkswagen Tiguan impeccable, le personnel est très professionnel et attentionné.", createdAt: "2026-04-08T15:00:00Z" },
  { id: "R005", bookingId: "B-ext-4", userId: "client-ext-d", userName: "Mohamed R.", carId: "2", rating: 4, comment: "Bonne voiture, rapport qualité-prix excellent. Quelques petites égratignures mais rien de grave.", createdAt: "2026-04-07T11:00:00Z" },
  { id: "R006", bookingId: "B-ext-5", userId: "client-ext-e", userName: "Nadia K.", carId: "4", rating: 5, comment: "Toyota Corolla hybride, super économique en carburant. Je la recommande pour les longs trajets.", createdAt: "2026-04-06T14:00:00Z" },
];
