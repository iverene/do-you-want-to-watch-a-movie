import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Scope } from '@/services';

/**
 * Scope for Watched, Calendar and Stats, kept in the URL as `?scope=`: `ours` (watched together,
 * the default) or `mine`. The partner's solo watches are private, so there is no third option.
 */
export function useScope(): [Scope, (s: Scope) => void] {
  const [params, setParams] = useSearchParams();
  const scope: Scope = params.get('scope') === 'mine' ? 'mine' : 'ours';
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
