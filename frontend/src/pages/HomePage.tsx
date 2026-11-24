import { BrowseByGenre } from '@/components/home/BrowseByGenre';
import { Recommended } from '@/components/home/Recommended';
import { RecentlyWatched, UpNext } from '@/components/home/RecentAndUpNext';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export default function HomePage() {
  const desktop = useIsDesktop();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Home</h1>
      <Recommended />
      <BrowseByGenre />
      <div className="flex flex-col gap-6 lg:flex-row">
        <RecentlyWatched />
        {desktop && <UpNext />}
      </div>
    </div>
  );
}
