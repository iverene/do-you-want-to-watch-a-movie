import { useCallback } from 'react';
import { useSession } from './auth';

/** userId → display name. Names are never hard-coded; they come from auth.me(). */
export function useNames() {
  const { user, partner } = useSession();
  return useCallback(
    (id: string) => (id === user.id ? user.displayName : id === partner.id ? partner.displayName : 'someone'),
    [user, partner],
  );
}
