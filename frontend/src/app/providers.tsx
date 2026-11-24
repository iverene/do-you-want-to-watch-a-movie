import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/components/ui/Toast';
import { isApiError } from '@/services';
import { keys } from '@/queries/keys';

export function makeQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      // A lost session anywhere sends the guard back to /login.
      onError: (e, query) => {
        if (isApiError(e, 'UNAUTHORIZED') && query.queryKey[0] !== keys.me[0]) {
          void client.invalidateQueries({ queryKey: keys.me });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (e) => {
        if (isApiError(e, 'UNAUTHORIZED')) void client.invalidateQueries({ queryKey: keys.me });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (count, e) => !(isApiError(e) && e.status >= 400 && e.status < 500) && count < 2,
      },
    },
  });
  return client;
}

/** QueryClient, theme and toasts. Auth state is the `me` query (see queries/auth.ts). */
export function Providers({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [qc] = useState(() => client ?? makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
