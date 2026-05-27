import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStoredUser, normalizeAuthUser, setUnauthorizedHandler } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tm_token")?.trim() ?? "");
  const [user, setUser] = useState(() => getStoredUser());

  const logout = useCallback(() => {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    setToken("");
    setUser(null);
  }, []);

  const login = useCallback((newToken, newUser) => {
    const normalized = normalizeAuthUser(newUser);
    if (!newToken || !normalized) {
      throw new Error("Invalid login response");
    }
    setToken(newToken);
    setUser(normalized);
    localStorage.setItem("tm_token", newToken);
    localStorage.setItem("tm_user", JSON.stringify(normalized));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (token && !user) {
      logout();
    }
  }, [token, user, logout]);

  const updateUser = (partial) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...partial };
      localStorage.setItem("tm_user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

