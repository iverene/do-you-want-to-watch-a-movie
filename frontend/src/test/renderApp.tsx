import { render } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { Suspense } from 'react';
import { Providers, makeQueryClient } from '@/app/providers';
import { routes } from '@/app/router';
import { serviceConfig } from '@/services/config';
import { seed } from '@/services/mock/db';
import { clearSession, setSessionUserId } from '@/services/mock/session';

// The data router builds fetch Requests, which clash with jsdom's AbortSignal; useRoutes avoids that.
function AppRoutes() {
  return useRoutes(routes);
}

/** Render the whole app on mock services at a path, optionally signed in. */
export function renderApp(path: string, opts: { as?: 'u-alex' | 'u-sam' | null } = {}) {
  serviceConfig.mockLatencyMs = 0;
  localStorage.clear();
  sessionStorage.clear();
  seed();
  clearSession();
  const as = opts.as === undefined ? 'u-alex' : opts.as;
  if (as) setSessionUserId(as, true);
  const client = makeQueryClient();
  client.setDefaultOptions({ queries: { ...client.getDefaultOptions().queries, retry: false } });
  const utils = render(
    <Providers client={client}>
      <Suspense fallback={null}>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AppRoutes />
        </MemoryRouter>
      </Suspense>
    </Providers>,
  );
  return { ...utils, client };
}
