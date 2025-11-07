import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authLogin,
  authMe,
  authRegister,
} from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(
    () => localStorage.getItem("access") || null
  );
  const [refresh, setRefresh] = useState(
    () => localStorage.getItem("refresh") || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMe() {
      if (!access) {
        setLoading(false);
        return;
      }
      try {
        const me = await authMe(access);
        setUser(me);
      } catch (err) {
        setAccess(null);
        setRefresh(null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, [access]);

  async function login(username, password) {
    const data = await authLogin(username, password);
    setAccess(data.access);
    setRefresh(data.refresh);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    const me = await authMe(data.access);
    setUser(me);
  }

  async function register(payload) {
    await authRegister(payload);
  }

  function logout() {
    setUser(null);
    setAccess(null);
    setRefresh(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }

  const value = {
    user,
    access,
    refresh,
    loading,
    login,
    logout,
    register,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
