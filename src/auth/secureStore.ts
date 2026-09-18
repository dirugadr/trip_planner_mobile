import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'tripPlanner.sessionToken';

export function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export function setStoredToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export function clearStoredToken(): Promise<void> {
  return SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}
