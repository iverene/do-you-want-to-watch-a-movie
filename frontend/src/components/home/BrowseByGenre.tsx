import { useState } from 'react';
import { titleMeta } from '@/lib/format';
import { useBrowse, useGenres } from '@/queries/browse';
import type { BrowseCategory, Title } from '@/services';
import { ErrorState } from '../feedback/ErrorState';
import { PosterCard } from '../media/PosterCard';
import { Chip } from '../ui/Chip';
import { SectionHeader } from '../ui/SectionHeader';
import { PosterSkeletonRow } from '../ui/Skeleton';

function Row({ label, category, genreId }: { label: string; category: BrowseCategory; genreId?: string }) {
  const q = useBrowse({ category, genreId });
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-caps text-[11px] uppercase text-muted">{label}</h3>
      {q.isPending ? (
        <PosterSkeletonRow count={5} posterClass="w-[80px] h-[120px]" />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data.items.length === 0 ? (
        <p className="font-hand text-[17px] text-muted">nothing here in this genre yet.</p>
      ) : (
        <ul className="flex gap-3 overflow-x-auto pb-1">
          {q.data.items.map((t: Title) => (
            <li key={t.id}>
              <PosterCard
                title={t.title}
                posterUrl={t.posterUrl}
                tintKey={t.id}
                posterClass="w-[80px]"
                meta={titleMeta(t, { genre: false })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BrowseByGenre() {
  const genres = useGenres();
  const [genreId, setGenreId] = useState<string | undefined>();
  return (
    <section aria-labelledby="browse-title" className="flex flex-col gap-3">
      <SectionHeader title={<span id="browse-title">Browse by genre</span>} sub="TRENDING · TOP RATED" />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Genre">
        <Chip selected={!genreId} onClick={() => setGenreId(undefined)}>
          All
        </Chip>
        {genres.data?.items.map((g) => (
          <Chip key={g.id} selected={genreId === g.id} onClick={() => setGenreId(g.id)}>
            {g.name}
          </Chip>
        ))}
      </div>
      <Row label="Trending" category={genreId ? 'genre' : 'trending'} genreId={genreId} />
      <Row label="Top rated" category="top_rated" genreId={genreId} />
    </section>
  );
}
