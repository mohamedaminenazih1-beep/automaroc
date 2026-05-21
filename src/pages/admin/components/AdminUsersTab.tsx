import { useState, useEffect } from "react";
import { api } from "@/services/api";

type UserRole = "client" | "gestionnaire" | "admin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
  bookings: number;
  status?: "active" | "suspended";
}

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda"];
const ROLES: UserRole[] = ["client", "gestionnaire", "admin"];

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  client: { label: "Client", color: "text-green-700", bg: "bg-green-100" },
  gestionnaire: { label: "Gestionnaire", color: "text-orange-700", bg: "bg-orange-100" },
  admin: { label: "Admin", color: "text-red-700", bg: "bg-red-100" },
};

export function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  interface FormData { name: string; email: string; role: UserRole; city: string; }
  const defaultForm: FormData = { name: "", email: "", role: "client", city: "Casablanca" };

  useEffect(() => {
    api.users.getAll().then((data) => {
      setUsers(data.map((u: any) => ({ ...u, bookings: 0 }))); // bookings count placeholder
    }).catch(console.error);
  }, []);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setForm(defaultForm); setSelectedUser(null); setModal("add"); };
  const openEdit = (u: AdminUser) => { setSelectedUser(u); setForm({ name: u.name, email: u.email, role: u.role, city: u.city }); setModal("edit"); };
  const openView = (u: AdminUser) => { setSelectedUser(u); setModal("view"); };
  const openDelete = (u: AdminUser) => { setSelectedUser(u); setModal("delete"); };

  const handleSaveAdd = () => {
    if (!form.name || !form.email) return;
    const newUser: AdminUser = { id: `U${Date.now()}`, ...form, bookings: 0, status: "active" };
    setUsers((prev) => [newUser, ...prev]);
    setModal(null);
    showToast("Utilisateur ajouté !");
  };

  const handleSaveEdit = () => {
    if (!selectedUser || !form.name || !form.email) return;
    setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, ...form } : u));
    setModal(null);
    showToast("Utilisateur mis à jour !");
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setModal(null);
    showToast("Utilisateur supprimé.");
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
    showToast("Statut modifié !");
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50";

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white text-sm px-5 py-3 rounded-2xl font-medium">{toast}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { label: "Total utilisateurs", val: users.length, color: "text-gray-800" },
          { label: "Clients actifs", val: users.filter((u) => u.role === "client" && u.status !== "suspended").length, color: "text-green-700" },
          { label: "Suspendus", val: users.filter((u) => u.status === "suspended").length, color: "text-red-600" },
        ] as { label: string; val: number; color: string }[]).map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-sm" />
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, email..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 w-48" />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(["all", ...ROLES] as (UserRole | "all")[]).map((r) => (
              <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${filterRole === r ? "bg-green-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                {r === "all" ? "Tous" : ROLE_CONFIG[r].label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line text-sm" /></div>
          Ajouter un utilisateur
        </button>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} utilisateur(s)</p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {["Utilisateur", "Email", "Ville", "Rôle", "Réservations", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const rc = ROLE_CONFIG[u.role];
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full flex-shrink-0">
                          <span className="text-green-700 text-xs font-bold">
                            {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{u.email}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{u.city}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rc.bg} ${rc.color}`}>{rc.label}</span>
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-gray-700">{u.bookings}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleStatus(u.id)} className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${u.status === "suspended" ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                        {u.status === "suspended" ? "Suspendu" : "Actif"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openView(u)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 cursor-pointer" title="Voir">
                          <i className="ri-eye-line text-sm" />
                        </button>
                        <button onClick={() => openEdit(u)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-yellow-50 text-yellow-600 cursor-pointer" title="Modifier">
                          <i className="ri-edit-line text-sm" />
                        </button>
                        <button onClick={() => openDelete(u)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 cursor-pointer" title="Supprimer">
                          <i className="ri-delete-bin-line text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {modal === "view" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">Profil utilisateur</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-2xl mb-3">
                <span className="text-green-700 text-xl font-bold">
                  {selectedUser.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
              </div>
              <h4 className="font-bold text-gray-800">{selectedUser.name}</h4>
              <span className={`mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_CONFIG[selectedUser.role].bg} ${ROLE_CONFIG[selectedUser.role].color}`}>
                {ROLE_CONFIG[selectedUser.role].label}
              </span>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { icon: "ri-mail-line", val: selectedUser.email },
                { icon: "ri-map-pin-line", val: selectedUser.city },
                { icon: "ri-calendar-check-line", val: `${selectedUser.bookings} réservation(s)` },
                { icon: "ri-shield-line", val: selectedUser.status === "suspended" ? "Suspendu" : "Actif" },
              ].map((row) => (
                <div key={row.icon} className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 flex items-center justify-center"><i className={`${row.icon} text-gray-400`} /></div>
                  {row.val}
                </div>
              ))}
            </div>
            <button onClick={() => setModal(null)} className="mt-5 w-full py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">Fermer</button>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">{modal === "add" ? "Ajouter un utilisateur" : "Modifier l&apos;utilisateur"}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom complet <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom et prénom" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rôle</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={`${inputCls} bg-white cursor-pointer`}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={`${inputCls} bg-white cursor-pointer`}>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">Annuler</button>
              <button onClick={modal === "add" ? handleSaveAdd : handleSaveEdit} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 cursor-pointer whitespace-nowrap">
                {modal === "add" ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-2xl mx-auto mb-4">
              <i className="ri-user-unfollow-line text-red-500 text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Supprimer cet utilisateur ?</h3>
            <p className="text-sm text-gray-500 mb-5"><strong>{selectedUser.name}</strong> sera définitivement supprimé.</p>
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
