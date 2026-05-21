export type UserRole = "client" | "admin" | "gestionnaire" | "guest";

export interface MockUser {
  id: string;
  nom: string;
  prenom: string;
  name: string; // nom + " " + prenom (display)
  email: string;
  password: string;
  role: UserRole;
  dateNaissance: string; // YYYY-MM-DD
  pays: string;
  ville: string;
  phone: string;
  cin: string;
  numPermis: string;
  dateExpirationPermis: string; // YYYY-MM-DD
  avatar?: string;
  status: "active" | "suspended";
}

export const mockUsers: MockUser[] = [
  {
    id: "admin-001",
    nom: "Nazih",
    prenom: "Amine",
    name: "Amine Nazih",
    email: "admin@automaroc.ma",
    password: "Admin@2026",
    role: "admin",
    dateNaissance: "1985-03-15",
    pays: "Maroc",
    ville: "Casablanca",
    phone: "+212 661 000 001",
    cin: "BE123456",
    numPermis: "MA-ADM-001",
    dateExpirationPermis: "2030-03-15",
    status: "active",
  },
  {
    id: "gest-001",
    nom: "Bennani",
    prenom: "Karim",
    name: "Karim Bennani",
    email: "gestionnaire@automaroc.ma",
    password: "Gest@2026",
    role: "gestionnaire",
    dateNaissance: "1988-07-22",
    pays: "Maroc",
    ville: "Rabat",
    phone: "+212 662 000 002",
    cin: "BK987654",
    numPermis: "MA-GEST-001",
    dateExpirationPermis: "2028-07-22",
    status: "active",
  },
  {
    id: "client-001",
    nom: "Alaoui",
    prenom: "Youssef",
    name: "Youssef Alaoui",
    email: "client@automaroc.ma",
    password: "Client@2026",
    role: "client",
    dateNaissance: "1995-11-10",
    pays: "Maroc",
    ville: "Marrakech",
    phone: "+212 663 000 003",
    cin: "Y654321",
    numPermis: "MA-CLI-001",
    dateExpirationPermis: "2027-11-10",
    status: "active",
  },
];

export const AUTH_STORAGE_KEY = "automaroc_user";
