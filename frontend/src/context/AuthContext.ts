import { createContext } from "react";

export type AuthState = {
  userId: string | null;
  accessToken: string | null;
};

export type AuthContextValue = {
  userId: string | null;
  accessToken: string | null;
  setAuth: (state: AuthState) => void;
  clearAuth: () => void;
  isInitializing: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
