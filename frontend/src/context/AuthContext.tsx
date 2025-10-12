import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setAccessToken as storeAccessToken } from '../lib/authTokenStore.js';

type AuthState = {
  userId: string | null;
  accessToken: string | null;
};

type AuthContextValue = {
  userId: string | null;
  accessToken: string | null;
  setAuth: (state: AuthState) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ userId: null, accessToken: null });

  const setAuth = useCallback((state: AuthState) => {
    setAuthState(state);
    storeAccessToken(state.accessToken);
  }, []);

  const clearAuth = useCallback(() => {
    setAuthState({ userId: null, accessToken: null });
    storeAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    userId: authState.userId,
    accessToken: authState.accessToken,
    setAuth,
    clearAuth,
  }), [authState.accessToken, authState.userId, clearAuth, setAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
