import { Link, useLocation } from 'react-router-dom';
import { useSession } from '@/queries/auth';
import { cn } from '@/lib/cn';
import { TABS } from './nav';

/** Desktop: vertical tabs attached to the binder's right edge. Routes, so a nav with aria-current. */
export function TabRail() {
  const { pathname } = useLocation();
  const { user } = useSession();
  return (
    <nav aria-label="Main" className="absolute left-full top-[104px] flex flex-col gap-1.5">
      {TABS.map((t) => {
        const active = t.match(pathname);
        const to = t.to === '/profile' ? `/profile/${user.username}` : t.to;
        return (
          <Link
            key={t.to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'block w-[92px] rounded-r-lg border border-l-0 py-2.5 pl-3 pr-2 text-[13px] font-extrabold',
              active
                ? '-ml-px border-line bg-paper text-link'
                : 'border-transparent bg-tab text-ontab hover:brightness-110',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
