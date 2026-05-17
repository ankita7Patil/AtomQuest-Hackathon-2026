import { createContext, useContext, useMemo, useState } from "react";
import { api, clearSession, getStoredUser, setSession } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  async function login(email, password) {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setSession(data);
    setUser(data.user);
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: Boolean(user) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
