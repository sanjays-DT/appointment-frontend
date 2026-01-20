'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../api/axios.ts";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthResponse {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: FormData) => Promise<AuthResponse>;
  logout: () => void;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(false);

  /* ================= PERSIST ================= */

  useEffect(() => {
    token
      ? localStorage.setItem("token", token)
      : localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    user
      ? localStorage.setItem("user", JSON.stringify(user))
      : localStorage.removeItem("user");
  }, [user]);

  /* ================= LOGIN ================= */

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;

      setToken(token);
      setUser(user);

      navigate("/categories");
      return { ok: true };
    } catch (err: any) {
      return {
        ok: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */

  const register = async (data: FormData): Promise<AuthResponse> => {
    setLoading(true);
    try {
      await api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/login");
      return { ok: true };
    } catch (err: any) {
      return {
        ok: false,
        error: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
