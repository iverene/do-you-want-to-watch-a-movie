import { Link } from 'react-router-dom';
import type { Profile, Title } from '@/services';
import { Poster } from '../media/Poster';
import { PosterTile } from '../media/PosterTile';
import { StarRating } from '../media/StarRating';
import { SectionHeader } from '../ui/SectionHeader';

function TileGrid({ titles, empty, onOpen }: { titles: Title[]; empty: string; onOpen: (t: Title) => void }) {
  if (!titles.length) return <p className="font-hand text-[17px] text-muted">{empty}</p>;
  return (
    <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {titles.slice(0, 12).map((t) => (
        <li key={t.id}>
          <PosterTile title={t} onOpen={() => onOpen(t)} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

/** Watchlist (titles this person added), Liked (♡) and Recently rated. Titles open a preview. */
export function ProfileLists({ p, own, onOpen }: { p: Profile; own: boolean; onOpen: (t: Title) => void }) {
  const name = own ? 'you' : p.user.displayName;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <section aria-labelledby="pwl-title" className="flex flex-col gap-2">
          <SectionHeader
            title={<span id="pwl-title">Watchlist</span>}
            sub={own ? 'ADDED BY YOU' : `ADDED BY ${p.user.displayName.toUpperCase()}`}
          />
          <TileGrid
            titles={p.watchlistAdded.map((w) => w.title)}
            empty={`nothing added by ${name} yet.`}
            onOpen={onOpen}
          />
        </section>
        <section aria-labelledby="liked-title" className="flex flex-col gap-2">
          <SectionHeader title={<span id="liked-title">Liked</span>} sub="♥ HEARTED TITLES" />
          <TileGrid titles={p.liked} empty={`no ♥ from ${name} yet.`} onOpen={onOpen} />
        </section>
      </div>
      <section aria-labelledby="rr-title" className="flex flex-col gap-2">
        <SectionHeader title={<span id="rr-title">Recently rated</span>} />
        {p.recentlyRated.length === 0 ? (
          <p className="font-hand text-[17px] text-muted">no ratings to show yet.</p>
        ) : (
          <ul className="flex flex-col">
            {p.recentlyRated.map((s) => {
              const r = s.ratings.find((x) => x.userId === p.user.id)!;
              const body = (
                <>
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
                </>
              );
              const cls = 'flex w-full items-center gap-3 py-2 text-left hover:underline';
              return (
                <li key={s.id} className="border-b border-dashed border-dot last:border-0">
                  {own ? (
                    <Link to={`/watched/${s.id}`} className={cls}>
                      {body}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => onOpen(s.title)} className={cls}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
