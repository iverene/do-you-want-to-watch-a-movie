import { useSession } from '@/queries/auth';
import { DuoAvatars } from '../pixel/DuoAvatars';
import { StreakCard } from '../pixel/StreakCard';
import { MiniCalendar } from './MiniCalendar';

/** The couple's side of the binder (desktop only): avatars, streak and this month. */
export function LeftPage() {
  const { users } = useSession();
  return (
    <div className="flex flex-col gap-4">
      <div className="border border-line p-1">
        <DuoAvatars users={users} />
      </div>
      <StreakCard />
      <div className="dotted-divider" />
      <MiniCalendar />
    </div>
  );
}
