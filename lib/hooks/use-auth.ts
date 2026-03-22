"use client";

import { useState, useEffect } from "react";

// Test user credentials
const TEST_USER = {
  email: "sam@alqdigital.com",
  password: "S",
};

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn");
    const storedEmail = localStorage.getItem("userEmail");
    setIsLoggedIn(stored === "true");
    setUserEmail(storedEmail);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    // Validate credentials
    if (email === TEST_USER.email && password === TEST_USER.password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      setIsLoggedIn(true);
      setUserEmail(email);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail(null);
  };

  return { isLoggedIn, isLoading, login, logout, userEmail };
}
