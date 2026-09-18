import { apiClient } from './client';

export interface SessionUser {
  email: string;
  name: string | null;
  picture: string | null;
}

interface LoginResponse {
  token: string;
  user: SessionUser;
}

interface MeResponse {
  user: SessionUser;
}

// POST /api/auth/login — intercambia un ID token de Google por el JWT propio.
export function loginWithGoogle(credential: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', { credential });
}

// GET /api/auth/me — valida el JWT guardado y devuelve el usuario (restore de sesión).
export function fetchCurrentUser(): Promise<MeResponse> {
  return apiClient.get<MeResponse>('/api/auth/me');
}
