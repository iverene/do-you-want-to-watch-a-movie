import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Kind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  kind: Kind;
}
interface ToastApi {
  show: (message: string, kind?: Kind) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(0);
  const show = useCallback((message: string, kind: Kind = 'success') => {
    const id = ++next.current;
    setItems((xs) => [...xs, { id, message, kind }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3000);
  }, []);
  const api = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-auto lg:right-[max(80px,calc(50vw-450px))] lg:top-24 lg:items-end"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={cn(
              'pop-in pointer-events-auto max-w-sm border-2 px-3 py-2 text-[13px] font-bold shadow-card',
              t.kind === 'success' && 'border-success-border bg-success-bg text-success-text',
              t.kind === 'error' && 'border-red bg-paper text-red',
              t.kind === 'info' && 'border-pixel-border bg-yellow text-ink',
            )}
          >
            {t.kind === 'success' ? '✓ ' : ''}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
