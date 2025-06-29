import { createContext, useEffect, useState } from "react";

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(()=>localStorage.getItem("token")); // initialize from storage
  const [user, setUser] = useState(null); // you can fill this later with user info

  // Called once on mount, keeps auth in sync
  useEffect(() => {
  let savedToken = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");

  if (urlToken) {
    console.log("🌐 Google token found in URL");
    savedToken = urlToken;
    localStorage.setItem("token", urlToken);
    window.history.replaceState({}, document.title, "/");
  }

  if (savedToken) {
    console.log("🔐 AuthContext token set:", savedToken);
    setToken(savedToken);
  } else {
    console.warn("⚠️ No token found in storage or URL");
  }
}, []);

  // When user logs in
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // When user logs out
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
