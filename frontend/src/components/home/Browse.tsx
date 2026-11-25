import { useMemo, useState } from 'react';
import { useSession } from '@/queries/auth';
import { useBrowse, useGenres } from '@/queries/browse';
import { useScreenings } from '@/queries/screenings';
import type { BrowseQuery, Title } from '@/services';
import { ErrorState } from '../feedback/ErrorState';
import { Listbox } from '../ui/Listbox';
import { SectionHeader } from '../ui/SectionHeader';
import { PosterSkeletonRow } from '../ui/Skeleton';
import { PosterRow } from './PosterRow';

function Row({ label, q }: { label: string; q: BrowseQuery }) {
  const res = useBrowse(q);
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-caps text-[11px] uppercase text-muted">{label}</h3>
      {res.isPending ? (
        <PosterSkeletonRow count={6} posterClass="w-[96px] lg:w-[112px] aspect-[2/3]" />
      ) : res.isError ? (
        <ErrorState error={res.error} onRetry={() => void res.refetch()} />
      ) : res.data.items.length === 0 ? (
        <p className="font-hand text-[17px] text-muted">nothing new here yet.</p>
      ) : (
        <PosterRow label={label} items={res.data.items.map((title) => ({ title }))} />
      )}
    </div>
  );
}

/** The last two different titles you gave 4 or 5 stars, newest first. */
function useLovedRecently(): Title[] {
  const { user } = useSession();
  const mine = useScreenings({ scope: 'mine', pageSize: 60 });
  return useMemo(() => {
    const out: Title[] = [];
    for (const s of mine.data?.items ?? []) {
      const stars = s.ratings.find((r) => r.userId === user.id)?.stars ?? 0;
      if (stars >= 4 && !out.some((t) => t.id === s.title.id)) out.push(s.title);
      if (out.length === 2) break;
    }
    return out;
  }, [mine.data, user.id]);
}

export function Browse() {
  const genres = useGenres();
  const [genreId, setGenreId] = useState('');
  const loved = useLovedRecently();
  const g = genreId || undefined;
  const genreName = genres.data?.items.find((x) => x.id === genreId)?.name;

  return (
    <section aria-labelledby="browse-title" className="flex flex-col gap-4">
      <SectionHeader
        title={<span id="browse-title">Browse</span>}
        sub={genreName ? genreName.toUpperCase() : 'ALL GENRES'}
        right={
          <Listbox
            label="Genre"
            value={genreId}
            onChange={setGenreId}
            options={[
              { value: '', label: 'All genres' },
              ...(genres.data?.items ?? []).map((x) => ({ value: x.id, label: x.name })),
            ]}
          />
        }
      />
      <Row label="Trending" q={{ category: g ? 'genre' : 'trending', genreId: g }} />
      {loved[0] && (
        <Row
          label={`Because you watched ${loved[0].title}`}
          q={{ category: 'because', titleId: loved[0].id, genreId: g }}
        />
      )}
      <Row label="New releases" q={{ category: 'new_releases', genreId: g }} />
      <Row label="Top rated" q={{ category: 'top_rated', genreId: g }} />
      {loved[1] && (
        <Row
          label={`Because you watched ${loved[1].title}`}
          q={{ category: 'because', titleId: loved[1].id, genreId: g }}
        />
      )}
    </section>
  );
}
