import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("chameri_admin");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("chameri_token", data.token);
      localStorage.setItem("chameri_admin", JSON.stringify(data.admin));
      setAdmin(data.admin);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("chameri_token");
    localStorage.removeItem("chameri_admin");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
