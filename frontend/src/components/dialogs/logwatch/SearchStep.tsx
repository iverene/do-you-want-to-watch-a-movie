import { useState } from 'react';
import { useDebounced } from '@/hooks/useDebounced';
import { cn } from '@/lib/cn';
import { titleMeta, typeLabel } from '@/lib/format';
import { useSearch } from '@/queries/movies';
import { isApiError, type Title, type TypeFilter } from '@/services';
import { Poster } from '../../media/Poster';
import { ArrowButton } from '../../ui/ArrowLink';
import { LogWatchButton } from '../../ui/LogWatchButton';
import { Segmented } from '../../ui/Segmented';
import { Skeleton } from '../../ui/Skeleton';
import { initialDetails, WatchDetails } from './WatchDetails';
import { useSaveWatch } from './useSaveWatch';

export function SearchStep({
  mode,
  onManual,
  onDirty,
}: {
  mode: 'log' | 'watchlist';
  onManual: () => void;
  onDirty: (d: boolean) => void;
}) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [selected, setSelected] = useState<Title | null>(null);
  const [details, setDetails] = useState(initialDetails);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const debounced = useDebounced(q, 300);
  const search = useSearch(debounced, type);
  const { save, pending } = useSaveWatch(mode, setFieldErrors);
  const typing = q.trim() !== debounced.trim() || (search.isFetching && !search.data);
  const items = search.data?.items ?? [];

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <label htmlFor="log-search" className="sr-only">
          Search movies and series
        </label>
        <input
          id="log-search"
          data-autofocus
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onDirty(Boolean(e.target.value) || Boolean(selected));
          }}
          placeholder="Search a movie or series"
          autoComplete="off"
          className="h-11 border-2 border-tab bg-paper px-3 text-[15px]"
        />
        <Segmented
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'All' },
            { value: 'movie', label: 'Movies' },
            { value: 'tv', label: 'Series' },
          ]}
        />
        <div aria-live="polite" className="flex min-h-[160px] flex-col">
          {!debounced.trim() ? (
            <p className="font-hand text-[17px] text-muted">type a title to start..</p>
          ) : typing ? (
            <div role="status" aria-label="Searching" className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-[60px] w-10" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : search.isError ? (
            <p className="text-[13px] text-red">
              {isApiError(search.error, 'UPSTREAM')
                ? 'Search is taking a break. Add it manually?'
                : 'Search failed. Try again or add it manually.'}
            </p>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-muted">No matches. Try the original title, or add it manually.</p>
          ) : (
            <ul className="flex flex-col">
              {items.map((t) => {
                const on = selected?.id === t.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      'flex items-center gap-3 border-b border-dashed border-dot px-1 py-2',
                      on && 'bg-sky',
                    )}
                  >
                    <Poster
                      title={t.title}
                      posterUrl={t.posterUrl}
                      tintKey={t.id}
                      className="w-10"
                      decorative
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold">
                        {t.title} {t.year && <span className="font-normal text-muted">({t.year})</span>}
                      </p>
                      <p className="truncate text-[12px] text-muted">
                        {typeLabel(t.mediaType)} · {t.genres.map((g) => g.name).join(', ')}
                        {t.cast.length > 0 &&
                          ` · with ${t.cast
                            .slice(0, 2)
                            .map((c) => c.name)
                            .join(', ')}`}
                      </p>
                    </div>
                    {on ? (
                      <span className="font-caps text-[11px] text-tab">✓ SELECTED</span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Select ${t.title}`}
                        onClick={() => {
                          setSelected(t);
                          setDetails((d) => ({ ...d, season: '' }));
                          onDirty(true);
                        }}
                        className="bevel min-h-11 rounded px-3 text-[13px] font-bold lg:min-h-9"
                      >
                        Select
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="text-[13px] text-muted">
          Can&apos;t find it in the list? <ArrowButton onClick={onManual}>Add it manually</ArrowButton>
        </p>
      </div>
      <aside
        aria-label="Selected title"
        className="flex flex-col gap-4 border-t border-line pt-4 lg:w-[280px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
      >
        {selected ? (
          <>
            <div>
              <p className="font-pixel text-[20px] leading-tight">{selected.title}</p>
              <p className="text-[12px] text-muted">{titleMeta(selected)}</p>
            </div>
            {mode === 'log' && (
              <WatchDetails title={selected} value={details} onChange={setDetails} errors={fieldErrors} />
            )}
            <LogWatchButton
              icon={mode === 'log' ? '▶' : '+'}
              disabled={pending}
              onClick={() => save(selected, details)}
            >
              {mode === 'log' ? 'Save & rate' : 'Add to watchlist'}
            </LogWatchButton>
          </>
        ) : (
          <p className="font-hand text-[17px] text-muted">pick a title on the left.</p>
        )}
      </aside>
    </div>
  );
}
