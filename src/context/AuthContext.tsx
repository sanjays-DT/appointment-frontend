import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../api/axios.ts";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
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
  register: (body: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: Props) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  
  useEffect(() => {
    if (token && user) {
      navigate("/categories");
    }
  }, []);

  
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

      setLoading(false);

      navigate("/categories");

      return { ok: true };
    } catch (err: any) {
      setLoading(false);

      return {
        ok: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  
  const register = async (body: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", body);
      const { token, user } = res.data;

      setToken(token);
      setUser(user);

      setLoading(false);

      navigate("/login");

      return { ok: true };
    } catch (err: any) {
      setLoading(false);

      return {
        ok: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
