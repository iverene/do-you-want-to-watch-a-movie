import { useState } from 'react';
import { useLogWatch } from '@/app/LogWatchContext';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { BevelButton } from '@/components/ui/BevelButton';
import { Dropdown } from '@/components/ui/Dropdown';
import { PixelIconButton } from '@/components/ui/PixelIconButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { PosterSkeletonRow } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { MovieNights } from '@/components/watchlist/MovieNights';
import { SpinResult } from '@/components/watchlist/SpinResult';
import { WatchlistCard } from '@/components/watchlist/WatchlistCard';
import { useSession } from '@/queries/auth';
import { useRandomPick, useWatchlist } from '@/queries/watchlist';
import { errorMessage, type TypeFilter, type WatchlistItem } from '@/services';

export default function WatchlistPage() {
  const { user, partner } = useSession();
  const { open } = useLogWatch();
  const toast = useToast();
  const [type, setType] = useState<TypeFilter>('all');
  const [addedBy, setAddedBy] = useState('');
  const [sort, setSort] = useState<'both_want' | 'newest'>('both_want');
  const list = useWatchlist({ type, addedBy: addedBy || undefined, sort });
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
        <BevelButton dense onClick={() => open({ mode: 'watchlist' })}>
          + Add to watchlist
        </BevelButton>
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
        <Dropdown
          label="Added by"
          value={addedBy}
          onChange={setAddedBy}
          options={[
            { value: '', label: 'Added by anyone' },
            { value: user.id, label: `Added by ${user.displayName}` },
            { value: partner.id, label: `Added by ${partner.displayName}` },
          ]}
        />
        <Dropdown
          label="Sort"
          value={sort}
          onChange={(v) => setSort(v as 'both_want' | 'newest')}
          options={[
            { value: 'both_want', label: 'Sort: both want it first' },
            { value: 'newest', label: 'Sort: newest' },
          ]}
        />
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
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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
