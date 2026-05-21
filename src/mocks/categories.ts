export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  createdAt: string;
}

export const mockInitialCategories: Category[] = [
  {
    id: "cat-1",
    name: "Économique",
    icon: "ri-car-line",
    description: "Voitures compactes et abordables, idéales pour la ville et les petits budgets.",
    color: "bg-green-50 text-green-700",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Berline",
    icon: "ri-car-fill",
    description: "Berlines confortables pour les voyages d'affaires et les trajets longue distance.",
    color: "bg-sky-50 text-sky-700",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat-3",
    name: "SUV",
    icon: "ri-truck-line",
    description: "SUV spacieux et polyvalents pour toutes les routes, y compris les terrains difficiles.",
    color: "bg-orange-50 text-orange-700",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat-4",
    name: "Luxe",
    icon: "ri-vip-diamond-line",
    description: "Véhicules premium pour les occasions spéciales et les clients exigeants.",
    color: "bg-yellow-50 text-yellow-700",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat-5",
    name: "Utilitaire",
    icon: "ri-truck-fill",
    description: "Véhicules utilitaires pour le transport de marchandises et les déménagements.",
    color: "bg-gray-100 text-gray-700",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat-6",
    name: "Monospace",
    icon: "ri-roadster-line",
    description: "Monospaces familiaux pour les grands groupes et les familles nombreuses.",
    color: "bg-rose-50 text-rose-700",
    createdAt: "2026-01-01T00:00:00Z",
  },
];
