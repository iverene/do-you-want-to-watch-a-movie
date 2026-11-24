import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Binder } from '@/components/binder/Binder';
import { LineSkeleton } from '@/components/ui/Skeleton';
import { useHotkey } from '@/hooks/useHotkey';
import { LogWatchProvider, useLogWatch } from './LogWatchContext';
import { GlobalDialogs } from './GlobalDialogs';

function Shell() {
  const { open } = useLogWatch();
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  useHotkey('n', () => open());

  useEffect(() => {
    if (params.get('log') === '1') {
      open();
      const next = new URLSearchParams(params);
      next.delete('log');
      setParams(next, { replace: true });
    }
  }, [params, setParams, open]);

  return (
    <Binder onLog={() => open()}>
      <Suspense fallback={<LineSkeleton lines={6} />}>
        <div key={pathname} className="fade-in">
          <Outlet />
        </div>
      </Suspense>
      <GlobalDialogs />
    </Binder>
  );
}

export function AppShell() {
  return (
    <LogWatchProvider>
      <Shell />
    </LogWatchProvider>
  );
}
