"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Read cached session from localStorage
    const savedToken = localStorage.getItem("cloudops_token");
    const savedUser = localStorage.getItem("cloudops_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("cloudops_token");
        localStorage.removeItem("cloudops_user");
      }
    } else {
      // Auto-set default demo admin for smooth out-of-the-box demo if not set
      const demoUser = {
        id: 1,
        email: "admin@cloudops.io",
        full_name: "Alex Vance (Lead SRE)",
        role: "Lead SRE & Platform Architect"
      };
      const demoToken = "demo-local-jwt-token";
      setUser(demoUser);
      setToken(demoToken);
      localStorage.setItem("cloudops_token", demoToken);
      localStorage.setItem("cloudops_user", JSON.stringify(demoUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("cloudops_token", accessToken);
    localStorage.setItem("cloudops_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cloudops_token");
    localStorage.removeItem("cloudops_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
