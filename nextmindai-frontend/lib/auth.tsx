"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, setTokens, clearTokens } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, passwordConfirm: string) => Promise<void>;
  oauthLogin: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api<{ data: User }>("/auth/me/");
      setUser(res.data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { access } = getTokensLocal();
    if (access) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  async function login(email: string, password: string) {
    const res = await api<{ data: { user: User; tokens: { access: string; refresh: string } } }>(
      "/auth/login/",
      { method: "POST", json: { email, password } }
    );
    setTokens(res.data.tokens.access, res.data.tokens.refresh);
    setUser(res.data.user);
  }

  async function register(email: string, name: string, password: string, passwordConfirm: string) {
    const res = await api<{ data: { user: User; tokens: { access: string; refresh: string } } }>(
      "/auth/register/",
      { method: "POST", json: { email, name, password, password_confirm: passwordConfirm } }
    );
    setTokens(res.data.tokens.access, res.data.tokens.refresh);
    setUser(res.data.user);
  }

  async function oauthLogin(access: string, refresh: string) {
    setTokens(access, refresh);
    await fetchUser();
  }

  function logout() {
    const refresh =
      typeof window === "undefined" ? null : localStorage.getItem("refresh_token");
    if (refresh) {
      api("/auth/logout/", { method: "POST", json: { refresh } }).catch(() => {
        /* token cleared locally regardless */
      });
    }
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, oauthLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function getTokensLocal() {
  if (typeof window === "undefined") return { access: null };
  return { access: localStorage.getItem("access_token") };
}
