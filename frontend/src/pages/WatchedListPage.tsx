import { useLogWatch } from '@/app/LogWatchContext';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LogWatchButton } from '@/components/ui/LogWatchButton';
import { PosterSkeletonRow } from '@/components/ui/Skeleton';
import { Tag } from '@/components/ui/Tag';
import { ScreeningCard } from '@/components/watched/ScreeningCard';
import { WatchedFilters, useListFilters } from '@/components/watched/WatchedFilters';
import { WatchedHeader } from '@/components/watched/WatchedHeader';
import { groupScreenings } from '@/components/watched/groupScreenings';
import { useScope } from '@/hooks/useScope';
import { formatMonth } from '@/lib/dates';
import { plural } from '@/lib/format';
import { useScreenings } from '@/queries/screenings';

export default function WatchedListPage() {
  const [scope] = useScope();
  const [filters] = useListFilters();
  const list = useScreenings({ scope, ...filters });
  const { open } = useLogWatch();

  return (
    <div className="flex flex-col gap-4">
      <WatchedHeader view="list" />
      <WatchedFilters />
      {list.isPending ? (
        <PosterSkeletonRow count={5} posterClass="w-[104px] h-[150px]" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : list.data.items.length === 0 ? (
        <EmptyState
          message="nothing here yet.. log your first watch!"
          action={<LogWatchButton onClick={() => open()} />}
        />
      ) : (
        groupScreenings(list.data.items).map((g) =>
          g.kind === 'month' ? (
            <section key={g.key} aria-labelledby={`g-${g.key}`} className="flex flex-col gap-2">
              <h2 id={`g-${g.key}`} className="flex items-baseline gap-2">
                <span className="font-pixel text-[18px] lg:text-[20px]">{formatMonth(g.month)}</span>
                <span className="text-[12px] text-muted">{plural(g.items.length, 'title')}</span>
              </h2>
              <ul className="flex flex-wrap gap-3">
                {g.items.map((s) => (
                  <li key={s.id}>
                    <ScreeningCard s={s} />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              key={g.key}
              id={`undated-${g.year}`}
              aria-labelledby={`g-${g.key}`}
              className="flex flex-col gap-2 border border-dashed border-dot bg-panel p-3"
            >
              <h2 id={`g-${g.key}`} className="flex flex-wrap items-center gap-2 text-[13px]">
                <Tag>NO DATE</Tag>
                imported · watched in {g.year} · no exact date
              </h2>
              <ul className="flex flex-wrap gap-3">
                {g.items.map((s) => (
                  <li key={s.id}>
                    <ScreeningCard s={s} />
                  </li>
                ))}
              </ul>
            </section>
          ),
        )
      )}
    </div>
  );
}
