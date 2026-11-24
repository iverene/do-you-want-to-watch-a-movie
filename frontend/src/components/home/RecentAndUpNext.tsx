import { formatShort } from '@/lib/dates';
import { typeLabel } from '@/lib/format';
import { useHome } from '@/queries/home';
import { useNames } from '@/queries/useNames';
import { useSession } from '@/queries/auth';
import { EmptyState } from '../feedback/EmptyState';
import { ErrorState } from '../feedback/ErrorState';
import { Poster } from '../media/Poster';
import { StarRating } from '../media/StarRating';
import { PixelAvatar } from '../pixel/PixelAvatar';
import { ArrowLink } from '../ui/ArrowLink';
import { SectionHeader } from '../ui/SectionHeader';
import { LineSkeleton } from '../ui/Skeleton';
import { Tag } from '../ui/Tag';
import { Link } from 'react-router-dom';

export function RecentlyWatched() {
  const home = useHome();
  return (
    <section aria-labelledby="recent-title" className="flex min-w-0 flex-1 flex-col gap-2">
      <SectionHeader
        title={<span id="recent-title">Recently watched</span>}
        right={<ArrowLink to="/watched">See all</ArrowLink>}
      />
      {home.isPending ? (
        <LineSkeleton />
      ) : home.isError ? (
        <ErrorState error={home.error} onRetry={() => void home.refetch()} />
      ) : home.data.recentlyWatched.length === 0 ? (
        <EmptyState message="nothing here yet.. log your first watch!" />
      ) : (
        <ul className="flex flex-col">
          {home.data.recentlyWatched.map((s, i) => (
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
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-bold">{s.title.title}</span>
                    {i === 0 && <Tag variant="new">NEW!</Tag>}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {s.watchedOn ? formatShort(s.watchedOn) : s.watchedYear} · {typeLabel(s.title.mediaType)}
                  </span>
                </span>
                {s.averageStars !== null ? <StarRating value={s.averageStars} /> : <Tag>RATE IT</Tag>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function UpNext() {
  const home = useHome();
  const nameOf = useNames();
  const { user, partner } = useSession();
  return (
    <section aria-labelledby="upnext-title" className="flex min-w-0 flex-1 flex-col gap-2">
      <SectionHeader
        title={<span id="upnext-title">Watchlist</span>}
        sub="UP NEXT"
        right={<ArrowLink to="/watchlist">See all</ArrowLink>}
      />
      {home.isPending ? (
        <LineSkeleton />
      ) : home.isError ? (
        <ErrorState error={home.error} onRetry={() => void home.refetch()} />
      ) : home.data.upNext.length === 0 ? (
        <EmptyState message="watchlist's empty — add something you both want" />
      ) : (
        <ul className="flex flex-col">
          {home.data.upNext.map((w) => {
            const adder = w.addedBy === user.id ? user : partner;
            return (
              <li
                key={w.id}
                className="flex items-center gap-3 border-b border-dashed border-dot py-2 last:border-0"
              >
                <Poster
                  title={w.title.title}
                  posterUrl={w.title.posterUrl}
                  tintKey={w.title.id}
                  className="w-10"
                  decorative
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold">{w.title.title}</span>
                  <span className="flex items-center gap-1 font-hand text-[16px] text-muted">
                    <PixelAvatar avatar={adder.avatar} scale={2} /> added by {nameOf(w.addedBy)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
