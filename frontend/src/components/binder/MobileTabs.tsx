import { Link, useLocation } from 'react-router-dom';
import { useSession } from '@/queries/auth';
import { cn } from '@/lib/cn';
import { TABS } from './nav';

/** Mobile: tabs along the top of the binder. Settings is reached from Profile. No bottom bar. */
export function MobileTabs() {
  const { pathname } = useLocation();
  const { user } = useSession();
  const tabs = TABS.filter((t) => t.to !== '/settings');
  return (
    <nav aria-label="Main" className="flex gap-1 px-1">
      {tabs.map((t) => {
        const active = t.match(pathname) || (t.to === '/profile' && pathname.startsWith('/settings'));
        const to = t.to === '/profile' ? `/profile/${user.username}` : t.to;
        return (
          <Link
            key={t.to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center rounded-t-lg border border-b-0 px-1 text-[13px] font-extrabold',
              active ? 'border-line bg-paper text-link' : 'border-transparent bg-tab text-ontab',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
