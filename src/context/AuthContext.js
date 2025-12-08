import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();


  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch (err) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // LOGIN (using email, password)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;

      setToken(token);
      setUser(user);
      setLoading(false);

      navigate("/dashboard");

      return { ok: true };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message };
    }
  };

  // REGISTER (using body)
  const register = async (body) => {
    setLoading(true);
    try {
      await api.post("/auth/register", body);

      setLoading(false);

      // after register → go to login
      navigate("/login");

      return { ok: true };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
