import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import type { RegisterData } from "@/contexts/AuthContext";

const MOROCCAN_CITIES = [
  "Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès",
  "Oujda","Kénitra","Tétouan","Safi","Mohammedia","El Jadida","Beni Mellal",
  "Nador","Settat","Berrechid","Khémisset","Larache","Khouribga",
];

const COUNTRIES = [
  "Maroc","Algérie","Tunisie","Égypte","France","Belgique","Espagne",
  "Italie","Portugal","Allemagne","Canada","Pays-Bas","Suisse","Autres",
];

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,           label: "Au moins 8 caractères" },
  { test: (p: string) => /[A-Z]/.test(p),         label: "Au moins 1 majuscule" },
  { test: (p: string) => /[0-9]/.test(p),          label: "Au moins 1 chiffre" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p),  label: "Au moins 1 caractère spécial (@#$!...)" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d\s\-()]{8,20}$/;

function getMinBirthDate() {
  const d = new Date("2026-04-18");
  d.setFullYear(d.getFullYear() - 23);
  return d.toISOString().split("T")[0]; // Max date for input (must be <= this)
}

export default function SignUp() {
  const navigate = useNavigate();
  const { register, role } = useAuth();
  const { addWelcomeNotification } = useBooking();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterData & { confirmPassword: string }>({
    nom: "", prenom: "", dateNaissance: "", pays: "Maroc", ville: "",
    phone: "", cin: "", numPermis: "", dateExpirationPermis: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (role === "client") navigate("/catalogue");
  }, [role, navigate]);

  const today = "2026-04-18";
  const maxBirth = getMinBirthDate();

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.nom.trim()) errs.nom = "Le nom est requis";
    if (!form.prenom.trim()) errs.prenom = "Le prénom est requis";
    if (!form.dateNaissance) {
      errs.dateNaissance = "La date de naissance est requise";
    } else if (form.dateNaissance > maxBirth) {
      errs.dateNaissance = "Vous devez avoir au moins 23 ans pour louer un véhicule";
    }
    return errs;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.pays) errs.pays = "Le pays est requis";
    if (!form.ville) errs.ville = "La ville est requise";
    if (!PHONE_REGEX.test(form.phone)) errs.phone = "Numéro de téléphone invalide (ex: +212 661 234 567)";
    if (!form.cin.trim()) errs.cin = "Le CIN est requis";
    if (!form.numPermis.trim()) errs.numPermis = "Le numéro de permis est requis";
    if (!form.dateExpirationPermis) {
      errs.dateExpirationPermis = "La date d'expiration est requise";
    } else if (form.dateExpirationPermis < today) {
      errs.dateExpirationPermis = "Votre permis est expiré. Veuillez le renouveler avant de vous inscrire";
    }
    return errs;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!EMAIL_REGEX.test(form.email)) errs.email = "Format d'email invalide (ex: prenom@domaine.com)";
    const pwdFail = PASSWORD_RULES.find((r) => !r.test(form.password));
    if (pwdFail) errs.password = `Mot de passe invalide : ${pwdFail.label}`;
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Les mots de passe ne correspondent pas";
    return errs;
  };

  const nextStep = () => {
    const errs = step === 1 ? validateStep1() : step === 2 ? validateStep2() : {};
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const { confirmPassword, ...data } = form;
    void confirmPassword;
    const result = register(data);
    if (!result.success) {
      setErrors({ email: result.error || "Erreur lors de la création du compte" });
      setLoading(false);
      return;
    }
    if (result.isFirstLogin) {
      const userId = `client-${Date.now() - 800}`;
      addWelcomeNotification(userId, `${form.prenom} ${form.nom}`);
    }
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    navigate("/catalogue");
  };

  const strengthScore = (pwd: string) => PASSWORD_RULES.filter((r) => r.test(pwd)).length;
  const strength = strengthScore(form.password);
  const strengthLabel = ["", "Très faible", "Faible", "Bon", "Excellent"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-400", "bg-green-500"];

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)" }}>
        <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full mx-4">
          <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-5">
            <i className="ri-checkbox-circle-fill text-green-500 text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Compte créé avec succès !</h3>
          <p className="text-sm text-gray-500">Bienvenue chez AutoMaroc. Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const steps = ["Identité", "Documents", "Compte"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #66bb6a, transparent)" }} />
        <div className="absolute bottom-0 -left-12 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #43a047, transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/catalogue" className="inline-flex items-center justify-center gap-2 mb-3">
              <img src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png" alt="logo" className="w-8 h-8 object-contain" />
              <span className="text-base font-bold text-green-700">AutoMaroc</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Créer un compte</h2>
            <p className="text-sm text-gray-500 mt-1">Remplissez toutes les informations requises</p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-7 px-2">
            {steps.map((s, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={s} className="flex-1 flex flex-col items-center relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-1/2 top-4 w-full h-0.5 -translate-y-1/2 ${done ? "bg-green-400" : "bg-gray-200"}`} style={{ left: "50%", width: "100%" }} />
                  )}
                  <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                    done ? "bg-green-500 text-white" : active ? "bg-green-500 text-white ring-4 ring-green-100" : "bg-gray-200 text-gray-500"
                  }`}>
                    {done ? <i className="ri-check-line text-sm" /> : n}
                  </div>
                  <p className={`mt-1.5 text-xs font-medium ${active ? "text-green-700" : done ? "text-green-600" : "text-gray-400"}`}>{s}</p>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: IDENTITY ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Prénom <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type="text" placeholder="Votre prénom" value={form.prenom} onChange={set("prenom")}
                      className={`w-full pl-4 pr-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.prenom ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                    {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nom <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type="text" placeholder="Votre nom" value={form.nom} onChange={set("nom")}
                      className={`w-full pl-4 pr-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.nom ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                    {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Date de naissance <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-cake-line text-gray-400 text-sm" />
                  </div>
                  <input type="date" max={maxBirth} value={form.dateNaissance} onChange={set("dateNaissance")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all cursor-pointer ${errors.dateNaissance ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                </div>
                {errors.dateNaissance ? (
                  <p className="text-xs text-red-500 mt-1">{errors.dateNaissance}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Vous devez avoir au moins 23 ans pour louer un véhicule</p>
                )}
              </div>

              <button onClick={nextStep} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-all cursor-pointer whitespace-nowrap active:scale-95">
                Continuer <i className="ri-arrow-right-line ml-1" />
              </button>
              <p className="text-center text-xs text-gray-500">Déjà un compte ? <Link to="/" className="text-green-600 font-semibold cursor-pointer">Se connecter</Link></p>
            </div>
          )}

          {/* ── STEP 2: DOCUMENTS ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Pays de résidence <span className="text-red-400">*</span></label>
                  <select value={form.pays} onChange={set("pays")}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all cursor-pointer ${errors.pays ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Ville <span className="text-red-400">*</span></label>
                  {form.pays === "Maroc" ? (
                    <select value={form.ville} onChange={set("ville")}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all cursor-pointer ${errors.ville ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`}>
                      <option value="">Sélectionner</option>
                      {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder="Votre ville" value={form.ville} onChange={set("ville")}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.ville ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                  )}
                  {errors.ville && <p className="text-xs text-red-500 mt-1">{errors.ville}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Numéro de téléphone <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-phone-line text-gray-400 text-sm" />
                  </div>
                  <input type="tel" placeholder="+212 6XX XXX XXX" value={form.phone} onChange={set("phone")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Numéro CIN (Carte d&apos;Identité Nationale) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-id-card-line text-gray-400 text-sm" />
                  </div>
                  <input type="text" placeholder="ex: BE123456 ou A987654" value={form.cin} onChange={set("cin")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.cin ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                </div>
                {errors.cin && <p className="text-xs text-red-500 mt-1">{errors.cin}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">N° Permis de conduire <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="ex: C-123456" value={form.numPermis} onChange={set("numPermis")}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.numPermis ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                  {errors.numPermis && <p className="text-xs text-red-500 mt-1">{errors.numPermis}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Date expiration permis <span className="text-red-400">*</span></label>
                  <input type="date" min={today} value={form.dateExpirationPermis} onChange={set("dateExpirationPermis")}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all cursor-pointer ${errors.dateExpirationPermis ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                  {errors.dateExpirationPermis && <p className="text-xs text-red-500 mt-1">{errors.dateExpirationPermis}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  <i className="ri-arrow-left-line mr-1" /> Retour
                </button>
                <button onClick={nextStep} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-all cursor-pointer whitespace-nowrap active:scale-95">
                  Continuer <i className="ri-arrow-right-line ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: ACCOUNT ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Adresse email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-mail-line text-gray-400 text-sm" />
                  </div>
                  <input type="text" placeholder="prenom@domaine.com" value={form.email} onChange={set("email")}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                <p className="text-xs text-gray-400 mt-1">Cet email ne doit pas avoir été utilisé précédemment</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Mot de passe <span className="text-red-400">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-line text-gray-400 text-sm" />
                  </div>
                  <input type={showPwd ? "text" : "password"} placeholder="Créez un mot de passe sécurisé" value={form.password} onChange={set("password")}
                    onFocus={() => setPwdFocused(true)} onBlur={() => setPwdFocused(false)}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                  <button type="button" onClick={() => setShowPwd((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer">
                    <i className={`${showPwd ? "ri-eye-line" : "ri-eye-off-line"} text-gray-400 text-sm`} />
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map((l) => (
                        <div key={l} className={`h-1 flex-1 rounded-full transition-all ${strength >= l ? strengthColor[strength] : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{strengthLabel[strength]}</p>
                  </div>
                )}
                {/* Rules tooltip */}
                {(pwdFocused || errors.password) && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-1">
                    {PASSWORD_RULES.map((r) => (
                      <div key={r.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 flex items-center justify-center rounded-full flex-shrink-0 ${r.test(form.password) ? "bg-green-500" : "bg-gray-200"}`}>
                          <i className="ri-check-line text-white" style={{ fontSize: "8px" }} />
                        </div>
                        <span className={`text-xs ${r.test(form.password) ? "text-green-700" : "text-gray-500"}`}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Confirmer le mot de passe <span className="text-red-400">*</span>
                  <span className="ml-1 text-gray-400 font-normal">(saisie obligatoire, collage désactivé)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-lock-password-line text-gray-400 text-sm" />
                  </div>
                  <input type={showConfirm ? "text" : "password"} placeholder="Ressaisissez votre mot de passe" value={form.confirmPassword}
                    onChange={set("confirmPassword")} onPaste={(e) => e.preventDefault()}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"}`} />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer">
                    <i className={`${showConfirm ? "ri-eye-line" : "ri-eye-off-line"} text-gray-400 text-sm`} />
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  <i className="ri-arrow-left-line mr-1" /> Retour
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap active:scale-95">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin" />
                      Création...
                    </span>
                  ) : "Créer mon compte"}
                </button>
              </div>
              <p className="text-center text-xs text-gray-500">Déjà un compte ? <Link to="/" className="text-green-600 font-semibold cursor-pointer">Se connecter</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
