"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    const userPhone = localStorage.getItem("userPhone");
    if (loggedIn === "true" && userPhone) {
      setUser({ phone: userPhone });
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    // Replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (phone === "০১৭১২৩৪৫৬৭৮" && password === "demo123") {
          setUser({ phone });
          sessionStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userPhone", phone);
          resolve(true);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userPhone");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
