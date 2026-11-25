import { Link } from 'react-router-dom';
import type { Screening, Title } from '@/services';
import { FramedPoster } from '../media/FramedPoster';

/** Own profile: each poster opens your diary entry. Partner's: it opens the title preview. */
export function TopFive({ items, onOpen }: { items: (Screening | null)[]; onOpen?: (t: Title) => void }) {
  return (
    <ol className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {[0, 1, 2, 3, 4].map((i) => {
        const s = items[i];
        return (
          <li key={i} className="relative flex flex-col gap-1">
            <span
              aria-hidden
              className="absolute -left-1 -top-1 z-10 flex h-6 w-6 items-center justify-center border-2 border-pixel-border bg-yellow font-pixel text-[13px] text-pixel-text"
            >
              {i + 1}
            </span>
            {s ? (
              onOpen ? (
                <button
                  type="button"
                  onClick={() => onOpen(s.title)}
                  className="flex flex-col gap-1 text-left hover:underline"
                >
                  <FramedPoster
                    title={s.title.title}
                    posterUrl={s.title.posterUrl}
                    tintKey={s.title.id}
                    mat="p-1"
                  />
                  <span className="truncate text-[12px] font-bold">
                    <span className="sr-only">Number {i + 1}: </span>
                    {s.title.title}
                  </span>
                </button>
              ) : (
                <Link to={`/watched/${s.id}`} className="flex flex-col gap-1 hover:underline">
                  <FramedPoster
                    title={s.title.title}
                    posterUrl={s.title.posterUrl}
                    tintKey={s.title.id}
                    mat="p-1"
                  />
                  <span className="truncate text-[12px] font-bold">
                    <span className="sr-only">Number {i + 1}: </span>
                    {s.title.title}
                  </span>
                </Link>
              )
            ) : (
              <>
                <div className="flex aspect-[2/3] items-center justify-center border-2 border-dashed border-dot font-caps text-[11px] text-muted">
                  EMPTY
                </div>
                <span className="sr-only">Number {i + 1}: empty</span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
