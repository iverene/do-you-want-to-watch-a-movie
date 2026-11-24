import { useEffect, useState } from 'react';

export function OfflineBar() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  if (!offline) return null;
  return (
    <div
      role="status"
      className="border-y border-pixel-border bg-yellow px-3 py-1 text-center text-[12px] text-ink"
    >
      You&apos;re offline. Changes will sync when you&apos;re back.
    </div>
  );
}
