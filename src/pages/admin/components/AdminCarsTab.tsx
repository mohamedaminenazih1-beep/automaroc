import { useState, useEffect } from "react";
import { api } from "@/services/api";

type Car = any;

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"];
const CATEGORIES = ["Économique", "Berline", "SUV", "Utilitaire"];
const TRANSMISSIONS = ["Manuelle", "Automatique"];
const FUELS = ["Essence", "Diesel", "Hybride", "Électrique"];

interface CarFormData {
  name: string;
  brand: string;
  category: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuel: string;
  city: string;
  available: boolean;
  image: string;
  rating: number;
}

const defaultForm: CarFormData = {
  name: "", brand: "", category: "Économique", pricePerDay: 300,
  seats: 5, transmission: "Manuelle", fuel: "Essence",
  city: "Casablanca", available: true, image: "", rating: 4.5,
};

export function AdminCarsTab() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    api.cars.getAll().then(setCars).catch(console.error);
  }, []);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("Toutes");
  const [filterCat, setFilterCat] = useState("Toutes");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CarFormData>(defaultForm);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = cars.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    const matchCity = filterCity === "Toutes" || c.city === filterCity;
    const matchCat = filterCat === "Toutes" || c.category === filterCat;
    return matchSearch && matchCity && matchCat;
  });

  const openAdd = () => {
    setForm(defaultForm);
    setSelectedCar(null);
    setModal("add");
  };

  const openEdit = (car: Car) => {
    setSelectedCar(car);
    setForm({ name: car.name, brand: car.brand, category: car.category, pricePerDay: car.pricePerDay, seats: car.seats, transmission: car.transmission, fuel: car.fuel, city: car.city, available: car.available, image: car.image, rating: car.rating });
    setModal("edit");
  };

  const openDelete = (car: Car) => {
    setSelectedCar(car);
    setModal("delete");
  };

  const handleSaveAdd = async () => {
    if (!form.name || !form.brand) return;
    const newCar = { ...form, id: `car-${Date.now()}` };
    try {
      await api.cars.create(newCar);
      setCars((prev) => [newCar, ...prev]);
      setModal(null);
      showToast("Voiture ajoutée avec succès !");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'ajout.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedCar || !form.name || !form.brand) return;
    try {
      await api.cars.update(selectedCar.id, form);
      setCars((prev) => prev.map((c) => c.id === selectedCar.id ? { ...c, ...form } : c));
      setModal(null);
      showToast("Voiture mise à jour !");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la mise à jour.");
    }
  };

  const handleDelete = async () => {
    if (!selectedCar) return;
    try {
      await api.cars.delete(selectedCar.id);
      setCars((prev) => prev.filter((c) => c.id !== selectedCar.id));
      setModal(null);
      showToast("Voiture supprimée.");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la suppression.");
    }
  };

  const toggleAvailability = async (id: string) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    try {
      const newStatus = !car.available;
      await api.cars.update(id, { available: newStatus });
      setCars((prev) => prev.map((c) => {
        if (c.id === id) return { ...c, available: newStatus };
        return c;
      }));
      showToast("Disponibilité mise à jour !");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la mise à jour.");
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50";

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white text-sm px-5 py-3 rounded-2xl font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-sm" />
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 w-44" />
          </div>
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-400 bg-white cursor-pointer">
            <option value="Toutes">Toutes villes</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-400 bg-white cursor-pointer">
            <option value="Toutes">Toutes catégories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></div>
          Ajouter une voiture
        </button>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} voiture(s) trouvée(s)</p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Voiture</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Catégorie</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Ville</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Prix/jour</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Carburant</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Note</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Disponibilité</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {car.image ? <img src={car.image} alt={car.name} className="w-full h-full object-cover object-top" /> : <div className="w-full h-full flex items-center justify-center"><i className="ri-car-line text-gray-400" /></div>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 whitespace-nowrap">{car.name}</p>
                        <p className="text-gray-400">{car.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{car.category}</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{car.city}</td>
                  <td className="px-5 py-3 font-bold text-green-700 whitespace-nowrap">{car.pricePerDay} MAD</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{car.fuel}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-400 text-xs" />
                      <span className="font-medium text-gray-700">{car.rating}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleAvailability(car.id)} className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${car.available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                      {car.available ? "Disponible" : "Loué"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(car)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 transition-colors cursor-pointer" title="Modifier">
                        <i className="ri-edit-line text-sm" />
                      </button>
                      <button onClick={() => openDelete(car)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer" title="Supprimer">
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">Aucune voiture trouvée</div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
              <h3 className="text-base font-bold text-gray-800">{modal === "add" ? "Ajouter une voiture" : "Modifier la voiture"}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Dacia Logan" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Marque <span className="text-red-400">*</span></label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="ex: Dacia" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${inputCls} bg-white cursor-pointer`}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={`${inputCls} bg-white cursor-pointer`}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prix/jour (MAD)</label>
                  <input type="number" min={100} value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre de places</label>
                  <input type="number" min={2} max={12} value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Transmission</label>
                  <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className={`${inputCls} bg-white cursor-pointer`}>
                    {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Carburant</label>
                  <select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className={`${inputCls} bg-white cursor-pointer`}>
                    {FUELS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Note (0-5)</label>
                  <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputCls} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="available-check" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-green-500 cursor-pointer" />
                  <label htmlFor="available-check" className="text-sm text-gray-700 font-medium cursor-pointer">Disponible</label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL Image</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className={inputCls} />
                {form.image && (
                  <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-gray-100">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover object-top" />
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                Annuler
              </button>
              <button onClick={modal === "add" ? handleSaveAdd : handleSaveEdit} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
                {modal === "add" ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-2xl mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-800 text-center mb-2">Supprimer cette voiture ?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              <strong>{selectedCar.name}</strong> sera définitivement supprimée du parc.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">Annuler</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 cursor-pointer whitespace-nowrap">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
