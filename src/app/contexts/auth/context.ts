// src/app/contexts/auth/context.ts
import { createContext, useContext } from "react";
import { User } from "@/@types/user";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  errorMessage: string | null;
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthProvider = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthProvider);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};