// Mock session: the signed-in user id. "Keep me signed in" uses localStorage, otherwise sessionStorage
// (ends when the browser closes), matching the real cookie behavior.
import { serviceConfig } from '../config';

const key = () => `${serviceConfig.mockStorageKey}-session`;

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

let memory: string | null = null;

export function getSessionUserId(): string | null {
  return (
    safe(() => localStorage.getItem(key()), null) ?? safe(() => sessionStorage.getItem(key()), null) ?? memory
  );
}

export function setSessionUserId(userId: string, remember: boolean): void {
  memory = userId;
  safe(() => (remember ? localStorage : sessionStorage).setItem(key(), userId), undefined);
}

export function clearSession(): void {
  memory = null;
  safe(() => localStorage.removeItem(key()), undefined);
  safe(() => sessionStorage.removeItem(key()), undefined);
}
