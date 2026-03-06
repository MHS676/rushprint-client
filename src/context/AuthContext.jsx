import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("admin_email"));

  const login = (tok, email) => {
    localStorage.setItem("admin_token", tok);
    localStorage.setItem("admin_email", email);
    setToken(tok);
    setAdminEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    setToken(null);
    setAdminEmail(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, adminEmail, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
