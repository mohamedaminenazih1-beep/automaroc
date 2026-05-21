import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,        label: "Au moins 8 caractères" },
  { test: (p: string) => /[A-Z]/.test(p),      label: "Au moins 1 majuscule" },
  { test: (p: string) => /[0-9]/.test(p),       label: "Au moins 1 chiffre" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "Au moins 1 caractère spécial" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, role, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);

  useEffect(() => {
    if (role === "admin") navigate("/admin");
    else if (role === "gestionnaire") navigate("/manager");
    else if (role === "client") navigate("/catalogue");
  }, [role, navigate]);

  const emailValid = EMAIL_REGEX.test(email);
  const pwdRulesOk = PASSWORD_RULES.every((r) => r.test(password));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      setError("Format d'email invalide (ex: prenom@domaine.com)");
      return;
    }
    if (!pwdRulesOk) {
      setError("Le mot de passe ne respecte pas les règles de sécurité");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    if (!result.success) {
      setError(result.error || "Erreur de connexion");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #66bb6a, transparent)" }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #43a047, transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8">
          <div className="text-center mb-8">
            <Link to="/catalogue" className="inline-flex items-center justify-center gap-2 mb-4">
              <img src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png" alt="logo" className="w-9 h-9 object-contain" />
              <span className="text-lg font-bold text-green-700">AutoMaroc</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Connexion</h2>
            <p className="text-sm text-gray-500 mt-1">Content de vous revoir !</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600 ml-1 block mb-1.5">Adresse email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-gray-400 text-base" />
                </div>
                <input
                  type="text"
                  placeholder="prenom@domaine.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                  className={`w-full pl-11 pr-10 py-3 border rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    emailTouched && !emailValid && email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-400 focus:ring-green-100"
                  }`}
                  required
                />
                {emailTouched && email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className={`text-sm ${emailValid ? "ri-checkbox-circle-fill text-green-500" : "ri-error-warning-fill text-red-400"}`} />
                  </div>
                )}
              </div>
              {emailTouched && email && !emailValid && (
                <p className="text-xs text-red-500 mt-1 ml-2">Format invalide. Exemple : nom@domaine.com</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-600 ml-1 block mb-1.5">Mot de passe</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-base" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={() => setPwdFocused(false)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer">
                  <i className={`${showPassword ? "ri-eye-line" : "ri-eye-off-line"} text-gray-400 text-base`} />
                </button>
              </div>
              {/* Password rules */}
              {(pwdFocused || (password && !pwdRulesOk)) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-2xl space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Règles de sécurité :</p>
                  {PASSWORD_RULES.map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 flex items-center justify-center rounded-full ${r.test(password) ? "bg-green-500" : "bg-gray-200"}`}>
                        <i className={`text-white ri-check-line`} style={{ fontSize: "9px" }} />
                      </div>
                      <span className={`text-xs ${r.test(password) ? "text-green-700" : "text-gray-500"}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-error-warning-line text-red-500 text-sm" />
                </div>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm transition-all duration-200 disabled:opacity-70 cursor-pointer whitespace-nowrap active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-base" />
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const result = await googleLogin();
                if (!result.success) {
                  setError(result.error || "Erreur Google Sign-In");
                }
                setLoading(false);
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-70"
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Se connecter avec Google</span>
            </button>

          <div className="mt-4 p-3 bg-green-50 rounded-2xl border border-green-100">
            <p className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1">
              <i className="ri-information-line text-sm" />
              Comptes de démonstration :
            </p>
            <div className="space-y-1 text-xs text-green-600">
              <p>Admin: <span className="font-mono font-bold">admin@automaroc.ma</span> / <span className="font-mono font-bold">Admin@2026</span></p>
              <p>Gestionnaire: <span className="font-mono font-bold">gestionnaire@automaroc.ma</span> / <span className="font-mono font-bold">Gest@2026</span></p>
              <p>Client: <span className="font-mono font-bold">client@automaroc.ma</span> / <span className="font-mono font-bold">Client@2026</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
