import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Shared Auth Hook for Rivalis Boxing
 * Integrated with Hub authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from Hub context (passed via localStorage or direct state)
    const savedUser = localStorage.getItem("rivalis_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    // Navigate back to hub login if not authenticated
    window.location.href = "/login";
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rivalis_user");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    isLoggingIn: false,
    isLoggingOut: false,
  };
}
