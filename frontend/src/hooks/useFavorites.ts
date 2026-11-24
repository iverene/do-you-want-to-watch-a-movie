import { useCallback, useSyncExternalStore } from 'react';

// docs/API.md has no favorites endpoint yet, so ♡ is kept per user in this browser only.
const key = (userId: string) => `dywwam-favorites-${userId}`;
const listeners = new Set<() => void>();

function read(userId: string): string {
  try {
    return localStorage.getItem(key(userId)) ?? '[]';
  } catch {
    return '[]';
  }
}

export function useFavorite(userId: string, titleId: string | undefined): [boolean, () => void] {
  const raw = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(userId),
    () => '[]',
  );
  const ids = JSON.parse(raw) as string[];
  const on = Boolean(titleId && ids.includes(titleId));
  const toggle = useCallback(() => {
    if (!titleId) return;
    const cur = JSON.parse(read(userId)) as string[];
    const next = cur.includes(titleId) ? cur.filter((x) => x !== titleId) : [...cur, titleId];
    try {
      localStorage.setItem(key(userId), JSON.stringify(next));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  }, [userId, titleId]);
  return [on, toggle];
}
