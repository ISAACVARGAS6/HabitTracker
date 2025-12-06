import { createContext, useContext, useState } from "react";
import { getToken, saveToken, logout as logoutFn } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());

  function login(token) {
    saveToken(token);
    setToken(token);
  }

  function logout() {
    logoutFn();
    setToken(null);
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
