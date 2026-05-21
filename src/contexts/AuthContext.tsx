import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { MockUser, UserRole } from "@/mocks/auth";
import { GOOGLE_CLIENT_ID } from "@/config/googleAuth";
import { api } from "@/services/api";

const AUTH_STORAGE_KEY = "automaroc_user";

const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services SDK"));
    document.head.appendChild(script);
  });
};

export type { MockUser, UserRole };

export interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  dateNaissance: string;
  pays: string;
  ville: string;
  phone: string;
  cin: string;
  numPermis: string;
  dateExpirationPermis: string;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  enterAsGuest: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; isFirstLogin?: boolean }>;
  updateUser: (updates: Partial<Pick<MockUser, "nom" | "prenom" | "name" | "email" | "ville" | "pays" | "avatar" | "phone" | "cin" | "numPermis" | "dateExpirationPermis">>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored) as MockUser;
      const safeUser: MockUser = {
        nom: user.nom || (user.name?.split(" ").slice(1).join(" ") || ""),
        prenom: user.prenom || (user.name?.split(" ")[0] || ""),
        dateNaissance: user.dateNaissance || "2000-01-01",
        pays: user.pays || "Maroc",
        phone: user.phone || "",
        cin: user.cin || "",
        numPermis: user.numPermis || "",
        dateExpirationPermis: user.dateExpirationPermis || "2030-01-01",
        status: user.status || "active",
        ...user,
      };
      return { user: safeUser, isAuthenticated: true, role: safeUser.role };
    }
  } catch {
    // ignore
  }
  return { user: null, isAuthenticated: false, role: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(loadFromStorage);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        setAuthState({ user: res.user, isAuthenticated: true, role: res.user.role });
        return { success: true };
      }
      return { success: false, error: "Erreur inconnue" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({ user: null, isAuthenticated: false, role: null });
  }, []);

  const enterAsGuest = useCallback(() => {
    const guestUser: MockUser = {
      id: "guest",
      nom: "Visiteur",
      prenom: "",
      name: "Visiteur",
      email: "",
      password: "",
      role: "guest",
      dateNaissance: "",
      pays: "",
      ville: "",
      phone: "",
      cin: "",
      numPermis: "",
      dateExpirationPermis: "",
      status: "active",
    };
    setAuthState({ user: guestUser, isAuthenticated: false, role: "guest" });
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string; isFirstLogin?: boolean }> => {
    try {
      const res = await api.auth.register(data);
      if (res.success && res.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        setAuthState({ user: res.user, isAuthenticated: true, role: res.user.role });
        return { success: true, isFirstLogin: true };
      }
      return { success: false, error: "Erreur d'inscription" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<Pick<MockUser, "nom" | "prenom" | "name" | "email" | "ville" | "pays" | "avatar" | "phone" | "cin" | "numPermis" | "dateExpirationPermis">>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) return { success: false, error: "Non connecté" };
    try {
      // Pour l'instant, on met à jour le localStorage (TODO: endpoint API pour ça)
      const updatedUser = { ...authState.user, ...updates };
      if (updates.nom || updates.prenom) {
        updatedUser.name = `${updatedUser.prenom} ${updatedUser.nom}`;
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
      return { success: true };
    } catch (err: any) {
       return { success: false, error: err.message };
    }
  }, [authState.user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) return { success: false, error: "Non connecté" };
    try {
      // Pour l'instant on garde la logique locale (TODO: API endpoint)
      const updatedUser = { ...authState.user, password: newPassword };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
      return { success: true };
    } catch (err: any) {
       return { success: false, error: err.message };
    }
  }, [authState.user]);

  const googleLogin = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      console.warn("Google Client ID is not configured. Falling back to simulated login.");
      const mockGoogleUser = { email: "googleuser@example.com", nom: "User", prenom: "Google", name: "Google User", sub: `simulated-${Date.now()}` };
      try {
        const res = await api.auth.google(mockGoogleUser);
        if (res.success && res.user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
          setAuthState({ user: res.user, isAuthenticated: true, role: res.user.role });
          return { success: true };
        }
        return { success: false, error: "Erreur de simulation" };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    try {
      await loadGsiScript();
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) return resolve({ success: false, error: tokenResponse.error_description || tokenResponse.error });
            if (!tokenResponse.access_token) return resolve({ success: false, error: "Aucun jeton d'accès reçu de Google." });
            try {
              const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (!response.ok) throw new Error("Impossible de récupérer les informations de profil Google.");
              const profile = await response.json();
              if (!profile.email) return resolve({ success: false, error: "L'adresse email Google est requise." });

              const payload = {
                email: profile.email,
                nom: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "User",
                prenom: profile.given_name || profile.name?.split(" ")[0] || "Google",
                name: profile.name || `${profile.given_name || "Google"} ${profile.family_name || "User"}`.trim(),
                avatar: profile.picture,
                sub: profile.sub
              };

              const res = await api.auth.google(payload);
              if (res.success && res.user) {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
                setAuthState({ user: res.user, isAuthenticated: true, role: res.user.role });
                resolve({ success: true });
              } else {
                resolve({ success: false, error: "Erreur backend" });
              }
            } catch (err: any) {
              resolve({ success: false, error: err.message });
            }
          },
        });
        client.requestAccessToken({ prompt: "consent" });
      });
    } catch (err: any) {
      return { success: false, error: err.message || "Impossible de charger le SDK Google Sign-In" };
    }
  }, [setAuthState]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, enterAsGuest, register, updateUser, changePassword, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
