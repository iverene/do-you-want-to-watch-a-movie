import { useCallback, useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Scope } from '@/services';

const KEY = 'dywwam-scope';
const listeners = new Set<() => void>();

function readDefault(): Scope {
  try {
    return localStorage.getItem(KEY) || 'ours';
  } catch {
    return 'ours';
  }
}

/** The left page's "★ Ours" choice: the app-wide default scope, kept in localStorage. */
export function useDefaultScope(): [Scope, (s: Scope) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readDefault,
    () => 'ours',
  );
  const set = useCallback((s: Scope) => {
    try {
      localStorage.setItem(KEY, s);
    } catch {
      /* keep in memory only */
    }
    listeners.forEach((l) => l());
  }, []);
  return [value, set];
}

/** Scope for Watched, Calendar and Stats: `?scope=` in the URL, else the default scope. */
export function useScope(): [Scope, (s: Scope) => void] {
  const [params, setParams] = useSearchParams();
  const [fallback] = useDefaultScope();
  const scope = params.get('scope') || fallback;
  const setScope = useCallback(
    (s: Scope) =>
      setParams(
        (p) => {
          const next = new URLSearchParams(p);
          next.set('scope', s);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );
  return [scope, setScope];
}
