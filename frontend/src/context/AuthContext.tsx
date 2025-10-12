import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getAccessToken, setAccessToken as storeAccessToken, subscribe as subscribeToAccessToken } from '../lib/authTokenStore.js';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../lib/axios.js';

type AuthState = {
  userId: string | null;
  accessToken: string | null;
};

type AuthContextValue = {
  userId: string | null;
  accessToken: string | null;
  setAuth: (state: AuthState) => void;
  clearAuth: () => void;
  isInitializing: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ userId: null, accessToken: null });
  const lastAuthRef = useRef<AuthState>(authState);
  const navigate = useNavigate();
  const refreshAttemptedRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const setAuth = useCallback((state: AuthState) => {
    setAuthState(state);
    storeAccessToken(state.accessToken);
    setIsInitializing(false);
  }, []);

  const clearAuth = useCallback(() => {
    setAuthState({ userId: null, accessToken: null });
    storeAccessToken(null);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    const applyToken = (token: string | null) => {
      setAuthState((prev) => {
        if (token === null) {
          if (prev.userId === null && prev.accessToken === null) {
            return prev;
          }
          return { userId: null, accessToken: null };
        }
        if (prev.accessToken === token) {
          return prev;
        }
        return { ...prev, accessToken: token };
      });
    };

    const currentToken = getAccessToken();
    if (currentToken) {
      applyToken(currentToken);
    }

    const unsubscribe = subscribeToAccessToken(applyToken);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authState.accessToken || refreshAttemptedRef.current) {
      if (authState.accessToken) {
        setIsInitializing(false);
      }
      return;
    }
    refreshAttemptedRef.current = true;

    refreshAccessToken()
      .then((token) => {
        if (token) {
          storeAccessToken(token);
        }
      })
      .catch(() => {
        storeAccessToken(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [authState.accessToken]);

  useEffect(() => {
    const previouslyAuthed = Boolean(lastAuthRef.current.userId && lastAuthRef.current.accessToken);
    const currentlyAuthed = Boolean(authState.userId && authState.accessToken);
    if (previouslyAuthed && !currentlyAuthed) {
      navigate('/login', { replace: true });
    }
    lastAuthRef.current = authState;
  }, [authState, navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    userId: authState.userId,
    accessToken: authState.accessToken,
    setAuth,
    clearAuth,
    isInitializing,
  }), [authState.accessToken, authState.userId, clearAuth, isInitializing, setAuth]);

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
