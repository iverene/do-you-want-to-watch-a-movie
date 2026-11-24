import { BrowseByGenre } from '@/components/home/BrowseByGenre';
import { Recommended } from '@/components/home/Recommended';
import { RecentlyWatched, UpNext } from '@/components/home/RecentAndUpNext';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { DuoAvatars } from '@/components/pixel/DuoAvatars';
import { StreakCard } from '@/components/pixel/StreakCard';
import { useSession } from '@/queries/auth';

export default function HomePage() {
  const desktop = useIsDesktop();
  const { users } = useSession();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Home</h1>
      {!desktop && (
        <div className="flex flex-col gap-3">
          <StreakCard />
          <DuoAvatars users={users} scale={4} />
        </div>
      )}
      <Recommended />
      <BrowseByGenre />
      <div className="flex flex-col gap-6 lg:flex-row">
        <RecentlyWatched />
        {desktop && <UpNext />}
      </div>
    </div>
  );
}
