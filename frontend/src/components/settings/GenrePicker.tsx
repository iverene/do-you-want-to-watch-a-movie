import { useGenres } from '@/queries/browse';
import { useSetGenres } from '@/queries/me';
import { errorMessage } from '@/services';
import { Chip } from '../ui/Chip';
import { useToast } from '../ui/Toast';

/** Favorite genres: chip multi-select from the API's genre list; saves on every toggle. */
export function GenrePicker({ selected }: { selected: string[] }) {
  const genres = useGenres();
  const save = useSetGenres();
  const toast = useToast();
  return (
    <div role="group" aria-label="Favorite genres" className="flex flex-wrap gap-1.5">
      {genres.data?.items.map((g) => {
        const on = selected.includes(g.id);
        return (
          <Chip
            key={g.id}
            selected={on}
            disabled={save.isPending}
            onClick={() =>
              save.mutate(on ? selected.filter((x) => x !== g.id) : [...selected, g.id], {
                onError: (e) => toast.show(errorMessage(e), 'error'),
              })
            }
          >
            {g.name}
          </Chip>
        );
      })}
    </div>
  );
}
