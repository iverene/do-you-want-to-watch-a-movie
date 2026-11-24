import { useState } from 'react';
import { useDebounced } from '@/hooks/useDebounced';
import { titleMeta } from '@/lib/format';
import { useSearch } from '@/queries/movies';
import type { ImportRow, Title } from '@/services';

/** Pick another match: the row's candidates, or search the catalog. */
export function ChangeMatch({
  row,
  onPick,
  busy,
}: {
  row: ImportRow;
  onPick: (t: Title) => void;
  busy: boolean;
}) {
  const [q, setQ] = useState(row.rawTitle);
  const search = useSearch(useDebounced(q, 300), 'all');
  const options =
    q.trim() && q !== row.rawTitle
      ? (search.data?.items ?? [])
      : row.candidates.length
        ? row.candidates
        : (search.data?.items ?? []);
  return (
    <div className="flex flex-col gap-2 border border-dashed border-dot p-2">
      <label className="flex flex-col gap-1 text-[12px] font-extrabold">
        Search for the right title
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 border border-control bg-paper px-2 text-[13px] font-normal"
        />
      </label>
      {options.length === 0 ? (
        <p className="text-[12px] text-muted">No matches. Try another spelling, or add it manually.</p>
      ) : (
        <ul className="flex flex-col">
          {options.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPick(t)}
                className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-[13px] hover:bg-sky"
              >
                <span className="truncate font-bold">{t.title}</span>
                <span className="shrink-0 text-[12px] text-muted">{titleMeta(t, { genre: false })}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
