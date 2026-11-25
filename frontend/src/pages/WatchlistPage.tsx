import { useState } from 'react';
import { useLogWatch } from '@/app/LogWatchContext';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { BevelButton } from '@/components/ui/BevelButton';
import { PixelIconButton } from '@/components/ui/PixelIconButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { PosterSkeletonRow } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { MovieNights } from '@/components/watchlist/MovieNights';
import { SpinResult } from '@/components/watchlist/SpinResult';
import { WatchlistCard } from '@/components/watchlist/WatchlistCard';
import { useRandomPick, useWatchlist } from '@/queries/watchlist';
import { errorMessage, type TypeFilter, type WatchlistItem } from '@/services';

export default function WatchlistPage() {
  const { open } = useLogWatch();
  const toast = useToast();
  const [type, setType] = useState<TypeFilter>('all');
  const list = useWatchlist({ type });
  const spin = useRandomPick();
  const [picked, setPicked] = useState<WatchlistItem | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        as="h1"
        title="Watchlist"
        sub={list.data ? `${list.data.total} TITLES TO WATCH` : undefined}
        right={
          <Segmented
            label="Type"
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: 'All' },
              { value: 'movie', label: 'Movies' },
              { value: 'tv', label: 'Series' },
            ]}
          />
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <PixelIconButton
          aria-label="Spin: pick something at random"
          disabled={spin.isPending}
          onClick={() =>
            spin.mutate(
              { type },
              {
                onSuccess: ({ item }) => setPicked(item),
                onError: (e) => toast.show(errorMessage(e), 'error'),
              },
            )
          }
        >
          ?
        </PixelIconButton>
        <span className="text-[13px] text-muted">Can't decide? Spin for a random pick. Newest first.</span>
      </div>
      {picked && <SpinResult item={picked} onClose={() => setPicked(null)} />}
      <MovieNights />
      {list.isPending ? (
        <PosterSkeletonRow count={5} posterClass="w-[120px] h-[180px]" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : list.data.items.length === 0 ? (
        <EmptyState
          message="watchlist's empty — add something you both want"
          action={
            <BevelButton dense onClick={() => open({ mode: 'watchlist' })}>
              + Add to watchlist
            </BevelButton>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {list.data.items.map((item) => (
            <li key={item.id}>
              <WatchlistCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
