import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '@/queries/watchlist';
import type { Profile, WatchlistItem } from '@/services';
import { Poster } from '../media/Poster';
import { StarRating } from '../media/StarRating';
import { SectionHeader } from '../ui/SectionHeader';
import { Segmented } from '../ui/Segmented';

function SmallPosters({ items }: { items: WatchlistItem[] }) {
  if (!items.length) return <p className="font-hand text-[17px] text-muted">nothing here yet.</p>;
  return (
    <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {items.slice(0, 10).map((w) => (
        <li key={w.id} className="flex flex-col gap-0.5">
          <Poster
            title={w.title.title}
            posterUrl={w.title.posterUrl}
            tintKey={w.title.id}
            className="w-full"
            decorative
          />
          <span className="truncate text-[11px] font-bold">{w.title.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProfileLists({ p, own }: { p: Profile; own: boolean }) {
  const [tab, setTab] = useState<'added' | 'shared'>('added');
  const shared = useWatchlist({ sort: 'both_want' });
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section aria-labelledby="pwl-title" className="flex flex-col gap-2">
        <SectionHeader
          title={<span id="pwl-title">Watchlist</span>}
          right={
            <Segmented
              label="Watchlist view"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'added', label: own ? 'Added by me' : `Added by ${p.user.displayName}` },
                { value: 'shared', label: 'Shared' },
              ]}
            />
          }
        />
        <SmallPosters items={tab === 'added' ? p.watchlistAdded : (shared.data?.items ?? [])} />
      </section>
      <section aria-labelledby="rr-title" className="flex flex-col gap-2">
        <SectionHeader title={<span id="rr-title">Recently rated</span>} />
        {p.recentlyRated.length === 0 ? (
          <p className="font-hand text-[17px] text-muted">no ratings to show yet.</p>
        ) : (
          <ul className="flex flex-col">
            {p.recentlyRated.map((s) => {
              const r = s.ratings.find((x) => x.userId === p.user.id)!;
              return (
                <li key={s.id} className="border-b border-dashed border-dot last:border-0">
                  <Link to={`/watched/${s.id}`} className="flex items-center gap-3 py-2 hover:underline">
                    <Poster
                      title={s.title.title}
                      posterUrl={s.title.posterUrl}
                      tintKey={s.title.id}
                      className="w-10"
                      decorative
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold">{s.title.title}</span>
                      {r.comment && (
                        <span className="block truncate font-pixel text-[13px] text-muted">
                          &ldquo;{r.comment}&rdquo;
                        </span>
                      )}
                    </span>
                    <StarRating value={r.stars} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
