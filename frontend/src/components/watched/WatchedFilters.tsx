import { useSearchParams } from 'react-router-dom';
import { todayIn } from '@/lib/dates';
import { useGenres } from '@/queries/browse';
import type { ScreeningFilters, TypeFilter } from '@/services';
import { Dropdown } from '../ui/Dropdown';
import { ScopeSwitch } from './ScopeSwitch';

export type ListFilters = Omit<ScreeningFilters, 'scope'>;

export function useListFilters(): [ListFilters, (k: string, v: string) => void] {
  const [params, setParams] = useSearchParams();
  const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined);
  const filters: ListFilters = {
    year: num('year'),
    genreId: params.get('genre') ?? undefined,
    minStars: num('stars'),
    type: (params.get('type') as TypeFilter | null) ?? 'all',
  };
  const set = (k: string, v: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (v && v !== 'all') next.set(k, v);
        else next.delete(k);
        return next;
      },
      { replace: true },
    );
  return [filters, set];
}

export function WatchedFilters() {
  const [f, set] = useListFilters();
  const genres = useGenres();
  const thisYear = Number(todayIn().slice(0, 4));
  const years = Array.from({ length: 7 }, (_, i) => thisYear - i);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ScopeSwitch />
      <Dropdown
        label="Watched in"
        value={f.year ? String(f.year) : 'all'}
        onChange={(v) => set('year', v)}
        options={[
          { value: 'all', label: 'Watched in any year' },
          ...years.map((y) => ({ value: String(y), label: `Watched in ${y}` })),
        ]}
      />
      <Dropdown
        label="Genre"
        value={f.genreId ?? 'all'}
        onChange={(v) => set('genre', v)}
        options={[
          { value: 'all', label: 'Any genre' },
          ...(genres.data?.items ?? []).map((g) => ({ value: g.id, label: g.name })),
        ]}
      />
      <Dropdown
        label="Stars"
        value={f.minStars ? String(f.minStars) : 'all'}
        onChange={(v) => set('stars', v)}
        options={[
          { value: 'all', label: 'Any stars' },
          { value: '5', label: '★★★★★ only' },
          { value: '4', label: '4+ stars' },
          { value: '3', label: '3+ stars' },
          { value: '2', label: '2+ stars' },
        ]}
      />
      <Dropdown
        label="Type"
        value={f.type ?? 'all'}
        onChange={(v) => set('type', v)}
        options={[
          { value: 'all', label: 'Movies & series' },
          { value: 'movie', label: 'Movies' },
          { value: 'tv', label: 'Series' },
        ]}
      />
    </div>
  );
}
