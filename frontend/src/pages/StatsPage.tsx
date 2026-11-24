import { Link, useSearchParams } from 'react-router-dom';
import { BigNumber } from '@/components/charts/BigNumber';
import { MonthChart } from '@/components/charts/MonthChart';
import { PixelBarChart } from '@/components/charts/PixelBarChart';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Poster } from '@/components/media/Poster';
import { StarRating } from '@/components/media/StarRating';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Dropdown } from '@/components/ui/Dropdown';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LineSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ScopeSwitch } from '@/components/watched/ScopeSwitch';
import { useScope } from '@/hooks/useScope';
import { MONTH_NAMES, todayIn } from '@/lib/dates';
import { plural } from '@/lib/format';
import { useSession } from '@/queries/auth';
import { useStats } from '@/queries/stats';

export default function StatsPage() {
  const [scope] = useScope();
  const { partner } = useSession();
  const [params, setParams] = useSearchParams();
  const thisYear = Number(todayIn().slice(0, 4));
  const yearParam = params.get('year');
  const year = yearParam === 'all' ? undefined : Number(yearParam) || thisYear;
  const month = Number(params.get('month')) || undefined;
  const stats = useStats({ scope, year, month: year ? month : undefined });
  const set = (k: string, v: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (v) next.set(k, v);
        else next.delete(k);
        return next;
      },
      { replace: true },
    );

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        as="h1"
        title="Stats"
        right={<ArrowLink to={`/watched?scope=${encodeURIComponent(scope)}`}>Back to Watched</ArrowLink>}
      />
      <div className="flex flex-wrap items-center gap-2">
        <ScopeSwitch />
        <Dropdown
          label="Year"
          value={year ? String(year) : 'all'}
          onChange={(v) => set('year', v)}
          options={[
            { value: 'all', label: 'All years' },
            ...Array.from({ length: 7 }, (_, i) => ({
              value: String(thisYear - i),
              label: String(thisYear - i),
            })),
          ]}
        />
        {year && (
          <Dropdown
            label="Month"
            value={month ? String(month) : ''}
            onChange={(v) => set('month', v)}
            options={[
              { value: '', label: 'All months' },
              ...MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m })),
            ]}
          />
        )}
      </div>
      {stats.isPending ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[92px]" />
            ))}
          </div>
          <LineSkeleton lines={5} />
        </div>
      ) : stats.isError ? (
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <BigNumber
              label="Total watched"
              value={stats.data.total.toLocaleString('en-US')}
              caption={`${plural(stats.data.movies, 'movie')} · ${stats.data.series} series`}
            />
            <BigNumber
              label="Top genre"
              value={stats.data.topGenre?.genre.name ?? '—'}
              caption={stats.data.topGenre ? plural(stats.data.topGenre.count, 'title') : 'nothing yet'}
            />
            <BigNumber
              label="Taste match"
              value={stats.data.tasteMatchPercent === null ? '—' : `${stats.data.tasteMatchPercent}%`}
              caption={`with ${partner.displayName}, within 1 star`}
            />
            <BigNumber
              label="Together"
              value={stats.data.together}
              caption={`${stats.data.solo} solo · best streak ${plural(stats.data.bestStreak, 'week')}`}
            />
          </div>
          {stats.data.total === 0 ? (
            <EmptyState message="no watches in this period." />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <section aria-labelledby="genres-title" className="flex flex-col gap-2">
                <SectionHeader title={<span id="genres-title">Genres</span>} />
                <PixelBarChart
                  rows={stats.data.genres.slice(0, 5).map((g) => ({ label: g.genre.name, count: g.count }))}
                />
              </section>
              <section aria-labelledby="top-title" className="flex flex-col gap-2">
                <SectionHeader
                  title={<span id="top-title">Top rated</span>}
                  sub={scope === 'ours' ? 'AVERAGE OF YOU TWO' : 'THEIR OWN STARS'}
                />
                {stats.data.topRated.length === 0 ? (
                  <p className="font-hand text-[17px] text-muted">rate a few titles to see these.</p>
                ) : (
                  <ol className="flex flex-col">
                    {stats.data.topRated.map(({ screening: s, stars }, i) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 border-b border-dashed border-dot py-1.5 last:border-0"
                      >
                        <span className="w-4 font-pixel text-[18px] text-orange">{i + 1}</span>
                        <Poster
                          title={s.title.title}
                          posterUrl={s.title.posterUrl}
                          tintKey={s.title.id}
                          className="w-9"
                          decorative
                        />
                        <Link
                          to={`/watched/${s.id}`}
                          className="min-w-0 flex-1 truncate text-[14px] font-bold hover:underline"
                        >
                          {s.title.title}
                        </Link>
                        <StarRating value={stars} />
                        <span className="w-7 text-right text-[12px] font-bold">{stars}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          )}
          <section aria-labelledby="month-title" className="flex flex-col gap-2">
            <SectionHeader title={<span id="month-title">By month</span>} sub={String(year ?? thisYear)} />
            <MonthChart
              counts={stats.data.byMonth}
              year={year ?? thisYear}
              highlight={
                month ? month - 1 : year === thisYear || !year ? Number(todayIn().slice(5, 7)) - 1 : null
              }
            />
            {stats.data.undatedCount > 0 && (
              <p className="text-[12px] text-muted">
                {plural(stats.data.undatedCount, 'imported title')}{' '}
                {stats.data.undatedCount === 1 ? 'has' : 'have'} no month, so{' '}
                {stats.data.undatedCount === 1 ? 'it counts' : 'they count'} in the year only.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
