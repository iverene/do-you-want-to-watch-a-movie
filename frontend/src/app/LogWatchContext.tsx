import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Screening } from '@/services';

export type LogWatchRequest =
  | { mode: 'log' }
  | { mode: 'watchlist' }
  | { mode: 'rate'; screening: Screening; justSaved?: boolean };

interface Ctx {
  request: LogWatchRequest | null;
  open: (r?: LogWatchRequest) => void;
  close: () => void;
}

const LogWatchContext = createContext<Ctx | null>(null);

/** The global Log-a-watch dialog is not a route: anything can open it (CTA, N key, ?log=1). */
export function LogWatchProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<LogWatchRequest | null>(null);
  const open = useCallback((r: LogWatchRequest = { mode: 'log' }) => setRequest(r), []);
  const close = useCallback(() => setRequest(null), []);
  const value = useMemo(() => ({ request, open, close }), [request, open, close]);
  return <LogWatchContext.Provider value={value}>{children}</LogWatchContext.Provider>;
}

export function useLogWatch(): Ctx {
  const ctx = useContext(LogWatchContext);
  if (!ctx) throw new Error('useLogWatch must be used inside LogWatchProvider');
  return ctx;
}
