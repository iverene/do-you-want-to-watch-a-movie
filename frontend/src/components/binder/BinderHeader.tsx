import { useHome } from '@/queries/home';
import { useSession } from '@/queries/auth';
import { Counter } from '../ui/Counter';
import { LogWatchButton } from '../ui/LogWatchButton';

export function siteTitle(names: string[]): string {
  return `${names.join(' & ')}'s movie room ☆`;
}

export function BinderHeader({ onLog }: { onLog: () => void }) {
  const { data } = useHome();
  const { users } = useSession();
  return (
    <header className="flex items-center gap-4 px-2 pb-3 pt-1">
      <div className="w-[270px] shrink-0">
        <Counter today={data?.todayCount} total={data?.totalCount} />
      </div>
      <p className="min-w-0 flex-1 truncate font-pixel text-[22px] text-ink">
        {siteTitle(users.map((u) => u.displayName))}
      </p>
      <LogWatchButton onClick={onLog} aria-keyshortcuts="N" />
    </header>
  );
}

export function MobileHeader({ onLog }: { onLog: () => void }) {
  const { data } = useHome();
  const { users } = useSession();
  return (
    <header className="flex flex-col gap-1 px-3 pb-2 pt-3">
      <div className="flex items-center justify-between gap-2">
        <Counter today={data?.todayCount} total={data?.totalCount} />
        <LogWatchButton compact onClick={onLog} aria-keyshortcuts="N" />
      </div>
      <p className="truncate font-pixel text-[19px] text-ink">{siteTitle(users.map((u) => u.displayName))}</p>
    </header>
  );
}
