import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useTheme } from '@/hooks/useTheme';
import { useMe } from '@/queries/auth';
import { isApiError } from '@/services';
import { AppShell } from './AppShell';

/** Auth guard: `auth.me()`; on UNAUTHORIZED go to /login?next=<path>. */
export function RequireAuth() {
  const me = useMe();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const userTheme = me.data?.user.theme;

  useEffect(() => {
    if (userTheme && userTheme !== theme) setTheme(userTheme);
    // Only follow the saved per-user choice when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTheme]);

  if (me.isPending) {
    return (
      <div
        role="status"
        className="flex h-full items-center justify-center font-caps text-[11px] uppercase text-muted"
      >
        Unlocking the room..
      </div>
    );
  }
  if (me.isError) {
    if (isApiError(me.error, 'UNAUTHORIZED')) {
      const next = location.pathname + location.search;
      return <Navigate to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} replace />;
    }
    return (
      <div className="mx-auto mt-24 max-w-md bg-paper p-4">
        <ErrorState error={me.error} onRetry={() => void me.refetch()} />
      </div>
    );
  }
  return <AppShell />;
}
