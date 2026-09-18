import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { env } from '../config/env';
import { ApiError, setAuthToken, setUnauthorizedHandler } from '../api/client';
import { fetchCurrentUser, loginWithGoogle, SessionUser } from '../api/auth';
import { clearStoredToken, getStoredToken, setStoredToken } from './secureStore';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: Status;
  user: SessionUser | null;
  error: string | null;
  busy: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

GoogleSignin.configure({
  webClientId: env.googleWebClientId,
  iosClientId: env.googleIosClientId,
  offlineAccess: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signOutLocally = useCallback(async () => {
    setAuthToken(null);
    await clearStoredToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Cualquier 401 de la API (token vencido o revocado) nos manda a la pantalla de login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOutLocally();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOutLocally]);

  // Restaura la sesión guardada al abrir la app.
  useEffect(() => {
    (async () => {
      const token = await getStoredToken();
      if (!token) {
        setStatus('unauthenticated');
        return;
      }
      setAuthToken(token);
      try {
        const { user: sessionUser } = await fetchCurrentUser();
        setUser(sessionUser);
        setStatus('authenticated');
      } catch {
        await signOutLocally();
      }
    })();
  }, [signOutLocally]);

  const login = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        // el usuario cerró el picker de cuentas de Google, no es un error a mostrar
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Google no devolvió un ID token');
      }

      const { token, user: sessionUser } = await loginWithGoogle(idToken);
      await setStoredToken(token);
      setAuthToken(token);
      setUser(sessionUser);
      setStatus('authenticated');
    } catch (e) {
      if (e instanceof ApiError) {
        // incluye el caso de allowlist (403): "Tu cuenta no está habilitada para usar esta app"
        setError(e.message);
      } else if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
        // cancelado por el usuario, no es un error a mostrar
      } else {
        setError('No se pudo iniciar sesión con Google');
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch {
      // si falla el signOut nativo, igual cerramos la sesión local
    }
    await signOutLocally();
  }, [signOutLocally]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, error, busy, login, logout }),
    [status, user, error, busy, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
