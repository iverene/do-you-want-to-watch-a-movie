import { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { typeLabel } from '@/lib/format';
import { useRecommendations, useRefreshRecommendations } from '@/queries/recommendations';
import type { RecommendationFor, TypeFilter } from '@/services';
import { EmptyState } from '../feedback/EmptyState';
import { ErrorState } from '../feedback/ErrorState';
import { PosterCard } from '../media/PosterCard';
import { ArrowButton } from '../ui/ArrowLink';
import { SectionHeader } from '../ui/SectionHeader';
import { Segmented } from '../ui/Segmented';
import { PosterSkeletonRow, Skeleton } from '../ui/Skeleton';
import { TopPick } from './TopPick';

export function Recommended() {
  const [forWhom, setFor] = useState<RecommendationFor>('both');
  const [type, setType] = useState<TypeFilter>('all');
  const [spin, setSpin] = useState(0);
  const desktop = useIsDesktop();
  const recs = useRecommendations(forWhom, type);
  const refresh = useRefreshRecommendations();

  const all = recs.data ? [recs.data.top, ...recs.data.items].filter((r) => r !== null) : [];
  const top = all.length ? all[spin % all.length] : null;
  const rest = all.filter((r) => r !== top).slice(0, desktop ? 7 : 4);

  return (
    <section aria-labelledby="rec-title" className="flex flex-col gap-3">
      <SectionHeader
        title={<span id="rec-title">Recommended</span>}
        sub="AI PICKS FROM YOUR RATINGS"
        right={
          <>
            <Segmented
              label="Recommend for"
              value={forWhom}
              onChange={(v) => {
                setFor(v);
                setSpin(0);
              }}
              options={[
                { value: 'both', label: 'For both' },
                { value: 'me', label: 'For me' },
              ]}
            />
            <Segmented
              label="Type"
              value={type}
              onChange={(v) => {
                setType(v);
                setSpin(0);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'movie', label: 'Movies' },
                { value: 'tv', label: 'Series' },
              ]}
            />
          </>
        }
      />
      {recs.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-[200px] w-full" />
          <PosterSkeletonRow count={desktop ? 7 : 4} />
        </div>
      ) : recs.isError ? (
        <ErrorState error={recs.error} onRetry={() => void recs.refetch()} />
      ) : !top ? (
        <EmptyState message="you've watched everything we know about. impressive." />
      ) : (
        <>
          <TopPick
            pick={top}
            onSpin={
              all.length > 1
                ? () => setSpin((s) => s + 1 + Math.floor(Math.random() * (all.length - 1)))
                : undefined
            }
          />
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-extrabold">More picks for you</h3>
            <ArrowButton onClick={() => refresh.mutate(forWhom)} disabled={refresh.isPending}>
              {refresh.isPending ? 'Refreshing..' : 'Refresh'}
            </ArrowButton>
          </div>
          <ul className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-4 lg:grid-cols-7">
            {rest.map((r) => (
              <li key={r.title.id}>
                <PosterCard
                  title={r.title.title}
                  posterUrl={r.title.posterUrl}
                  tintKey={r.title.id}
                  posterClass="w-full"
                  meta={`${r.title.year ?? ''} · ${typeLabel(r.title.mediaType)}`}
                  extra={<span className="font-bold text-orange">{r.matchPercent}% match</span>}
                />
              </li>
            ))}
          </ul>
          {rest.length < (desktop ? 7 : 4) && (
            <p className="font-hand text-[17px] text-muted">
              {rest.length ? "that's every pick for now." : 'no more picks for now.'} rate a few more watches
              and we'll find new ones.
            </p>
          )}
        </>
      )}
    </section>
  );
}
