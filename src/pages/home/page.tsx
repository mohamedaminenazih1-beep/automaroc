import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { login, enterAsGuest, role, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [floatAnim, setFloatAnim] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setFloatAnim((p) => !p), 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (role === "admin") navigate("/admin");
    else if (role === "gestionnaire") navigate("/manager");
    else if (role === "client") navigate("/catalogue");
    else if (role === "guest") navigate("/catalogue");
  }, [role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    if (!result.success) {
      setError(result.error || "Erreur de connexion");
    }
    setLoading(false);
  };

  const handleGuest = () => {
    enterAsGuest();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)" }}>
      {/* Background decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #66bb6a, transparent)" }} />
        <div className="absolute top-1/2 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #43a047, transparent)" }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #81c784, transparent)" }} />
        {/* Decorative car silhouettes */}
        <div className="absolute top-8 right-1/3 opacity-10 text-8xl text-green-800">
          <i className="ri-car-line" />
        </div>
        <div className="absolute bottom-12 left-16 opacity-10 text-6xl text-green-800">
          <i className="ri-car-fill" />
        </div>
        <div className="absolute top-1/3 left-8 opacity-10 text-5xl text-green-800">
          <i className="ri-roadster-line" />
        </div>
        {/* Map pin decorations */}
        <div className="absolute top-16 left-1/3 opacity-15 text-5xl text-green-700">
          <i className="ri-map-pin-2-fill" />
        </div>
        <div className="absolute bottom-24 right-1/4 opacity-15 text-4xl text-green-700">
          <i className="ri-map-pin-2-fill" />
        </div>
        {/* Morocco map outline sketch */}
        <div className="absolute left-0 top-0 w-full h-full opacity-5">
          <img
            src="https://readdy.ai/api/search-image?query=Morocco%20map%20outline%20simple%20white%20line%20art%20minimalist%20clean%20country%20silhouette%20on%20transparent%20background%20vector%20style&width=1200&height=800&seq=mapbg1&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
        {/* Left - Illustration Area */}
        <div className="flex-1 flex flex-col items-center lg:items-start justify-center lg:pr-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 lg:mb-10">
            <img
              src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png"
              alt="AutoMaroc Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-green-800 leading-tight">AutoMaroc</h1>
              <p className="text-xs text-green-600 font-medium tracking-wide">Location de Voiture</p>
            </div>
          </div>

          {/* 3D-style illustration card */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-xl w-full max-w-md lg:max-w-lg transition-transform duration-1000"
            style={{ transform: floatAnim ? "translateY(-8px)" : "translateY(0px)" }}
          >
            <img
              src="https://readdy.ai/api/search-image?query=Morocco%20map%20with%20cars%20green%20pins%20Casablanca%20Rabat%20Marrakech%20Fes%20Tangier%20illustrated%203D%20style%20clean%20white%20background%20car%20rental%20mobile%20app%20mockup%20map%20overview&width=600&height=420&seq=heromap1&orientation=landscape"
              alt="Voitures disponibles au Maroc"
              className="w-full h-64 lg:h-80 object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-full">
                  <i className="ri-car-fill text-white text-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Voitures disponibles</p>
                  <p className="text-xs text-green-600 font-semibold">Partout au Maroc</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">35 dispo</span>
                </div>
              </div>
            </div>
            {/* Floating pins */}
            <div className="absolute top-6 left-8 flex items-center gap-1 animate-bounce" style={{ animationDuration: "2s" }}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-map-pin-2-fill text-green-400 text-xl" />
              </div>
              <span className="text-xs bg-white/80 rounded px-1 text-gray-700 font-medium">Tanger</span>
            </div>
            <div className="absolute top-10 right-16 flex items-center gap-1" style={{ animationDelay: "0.5s" }}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-map-pin-2-fill text-green-400 text-xl" />
              </div>
              <span className="text-xs bg-white/80 rounded px-1 text-gray-700 font-medium">Fès</span>
            </div>
          </div>

          <p className="mt-4 text-green-700 text-sm font-medium text-center lg:text-left">
            <i className="ri-map-pin-line mr-1" />
            Disponible dans toutes les villes du Maroc
          </p>
        </div>

        {/* Right - Login Card */}
        <div className="w-full max-w-md lg:max-w-sm xl:max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-1">
                <img
                  src="https://public.readdy.ai/ai/img_res/1859feb8-a77e-4ef5-a1cf-952f254effad.png"
                  alt="logo"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-sm font-semibold text-green-700">AutoMaroc</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">Connexion</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-gray-400 text-base" />
                </div>
                <input
                  type="email"
                  placeholder="Email / Courriel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                  required
                />
              </div>

              {/* Password label */}
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-1 block mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                  >
                    <i className={`${showPassword ? "ri-eye-line" : "ri-eye-off-line"} text-gray-400 text-base`} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-error-warning-line text-red-500 text-sm" />
                  </div>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
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
                ) : (
                  "Se connecter"
                )}
              </button>

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

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </form>

            {/* Bottom actions */}
            <div className="flex items-stretch gap-3 mt-2">
              <button
                onClick={() => navigate("/signup")}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className="ri-user-add-line text-gray-500 group-hover:text-green-600 text-lg" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 group-hover:text-green-700">Pas de compte ?</p>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-green-700 whitespace-nowrap">Créer un compte</p>
                </div>
              </button>

              <button
                onClick={handleGuest}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer group"
              >
                <div className="text-right flex-1">
                  <p className="text-xs font-bold text-gray-700 group-hover:text-green-700 whitespace-nowrap">Continuer comme</p>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-green-700">visiteur</p>
                </div>
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className="ri-login-circle-line text-gray-500 group-hover:text-green-600 text-lg" />
                </div>
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
