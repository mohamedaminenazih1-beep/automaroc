import { useState } from "react";
import { mockInitialCategories } from "@/mocks/categories";
import { allMockCars } from "@/mocks/extendedCars";
import type { Category } from "@/mocks/categories";

const ICON_OPTIONS = [
  "ri-car-line","ri-car-fill","ri-truck-line","ri-truck-fill","ri-roadster-line",
  "ri-steering-2-line","ri-bus-line","ri-taxi-line","ri-vip-diamond-line","ri-star-line",
];
const COLOR_OPTIONS = [
  { value: "bg-green-50 text-green-700", label: "Vert" },
  { value: "bg-sky-50 text-sky-700", label: "Bleu ciel" },
  { value: "bg-orange-50 text-orange-700", label: "Orange" },
  { value: "bg-yellow-50 text-yellow-700", label: "Jaune" },
  { value: "bg-rose-50 text-rose-700", label: "Rose" },
  { value: "bg-gray-100 text-gray-700", label: "Gris" },
  { value: "bg-emerald-50 text-emerald-700", label: "Émeraude" },
];

interface CatForm { name: string; icon: string; description: string; color: string; }
const EMPTY_FORM: CatForm = { name: "", icon: "ri-car-line", description: "", color: COLOR_OPTIONS[0].value };

export function AdminCategoriesTab() {
  const [categories, setCategories] = useState<Category[]>(mockInitialCategories);
  const [form, setForm] = useState<CatForm>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const getCarsInCategory = (name: string) =>
    allMockCars.filter((c) => c.category === name).length;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Le nom est requis";
    if (!form.description.trim()) errs.description = "La description est requise";
    const existing = categories.find((c) => c.name.toLowerCase() === form.name.toLowerCase() && c.id !== editId);
    if (existing) errs.name = "Cette catégorie existe déjà";
    return errs;
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, icon: cat.icon, description: cat.description, color: cat.color });
    setEditId(cat.id);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (editId) {
      setCategories((prev) => prev.map((c) => c.id === editId ? { ...c, ...form } : c));
      showToastMsg("Catégorie mise à jour !");
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      showToastMsg("Catégorie créée !");
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    showToastMsg("Catégorie supprimée.");
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white text-sm px-5 py-3 rounded-2xl font-medium">{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Catégories de Véhicules</h2>
          <p className="text-xs text-gray-500 mt-0.5">{categories.length} catégories — {allMockCars.length} véhicules au total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 cursor-pointer whitespace-nowrap transition-colors">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></div>
          Nouvelle catégorie
        </button>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = getCarsInCategory(cat.name);
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${cat.color.split(" ")[0]}`}>
                  <i className={`${cat.icon} ${cat.color.split(" ")[1]} text-2xl`} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 cursor-pointer" title="Modifier">
                    <i className="ri-edit-line text-sm" />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 cursor-pointer" title="Supprimer">
                    <i className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{cat.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.color}`}>
                  {cat.icon && <i className={`${cat.icon} mr-1 text-xs`} />}{cat.name}
                </span>
                <span className="text-xs text-gray-400 font-medium">{count} véhicule{count > 1 ? "s" : ""}</span>
              </div>

              {/* Cars in this category */}
              {count > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1.5">Véhicules :</p>
                  <div className="flex flex-wrap gap-1">
                    {allMockCars.filter((c) => c.category === cat.name).map((c) => (
                      <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full ${c.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Classification overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Classification du parc</h3>
        <div className="space-y-3">
          {categories.map((cat) => {
            const count = getCarsInCategory(cat.name);
            const pct = Math.round((count / allMockCars.length) * 100);
            return (
              <div key={cat.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${cat.color.split(" ")[0]} flex-shrink-0`}>
                  <i className={`${cat.icon} ${cat.color.split(" ")[1]} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{cat.name}</span>
                    <span className="text-gray-400">{count} véhicule{count > 1 ? "s" : ""} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${cat.color.split(" ")[0].replace("50", "400").replace("100", "400")}`}
                      style={{ width: `${pct}%`, backgroundColor: undefined }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">{editId ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nom de la catégorie <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ex: Économique, SUV, Luxe..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.name ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Description <span className="text-red-400">*</span></label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Décrivez cette catégorie..." rows={3}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 ${errors.description ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button key={icon} type="button" onClick={() => setForm((p) => ({ ...p, icon }))}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${form.icon === icon ? "border-green-400 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <i className={`${icon} text-gray-600 text-lg`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Couleur du badge</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setForm((p) => ({ ...p, color: opt.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-2 transition-all ${opt.value} ${form.color === opt.value ? "border-gray-500" : "border-transparent"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Aperçu :</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${form.color.split(" ")[0]}`}>
                    <i className={`${form.icon} ${form.color.split(" ")[1]} text-xl`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{form.name || "Nom de la catégorie"}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${form.color}`}>{form.name || "Badge"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
                {editId ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-2xl mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Supprimer la catégorie ?</h3>
            <p className="text-sm text-gray-500 mb-5">Les véhicules de cette catégorie ne seront pas supprimés, juste non catégorisés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer whitespace-nowrap">Annuler</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 cursor-pointer whitespace-nowrap">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
