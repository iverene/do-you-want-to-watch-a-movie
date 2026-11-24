import { useState } from 'react';
import { useGenres } from '@/queries/browse';
import { useCreateManual } from '@/queries/movies';
import { errorMessage, isApiError, type ImportRow, type MediaType, type Title } from '@/services';
import { PixelWindow } from '../dialogs/PixelWindow';
import { Chip } from '../ui/Chip';
import { Field, TextInput } from '../ui/Field';
import { LogWatchButton } from '../ui/LogWatchButton';
import { Segmented } from '../ui/Segmented';

/** Add an import row's title by hand (R9), then use it as the row's match. */
export function ImportManualDialog({
  row,
  onDone,
  onClose,
}: {
  row: ImportRow;
  onDone: (t: Title) => void;
  onClose: () => void;
}) {
  const genres = useGenres();
  const create = useCreateManual();
  const [title, setTitle] = useState(row.rawTitle);
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const local: Record<string, string> = {};
    if (!title.trim()) local.title = 'Add a title.';
    if (!genreIds.length) local.genreIds = 'Pick at least one genre.';
    setErrors(local);
    if (Object.keys(local).length) return;
    create.mutate(
      { title, genreIds, mediaType },
      {
        onSuccess: ({ title: t }) => onDone(t),
        onError: (e) => setErrors(isApiError(e) && e.fields ? e.fields : { root: errorMessage(e) }),
      },
    );
  };

  return (
    <PixelWindow title="Add it manually" onClose={onClose} width="lg:w-[560px]">
      <div className="flex flex-col gap-3">
        <Field label="Title" note="required" error={errors.title}>
          {(a) => (
            <TextInput {...a} value={title} onChange={(e) => setTitle(e.target.value)} data-autofocus />
          )}
        </Field>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-[13px] font-extrabold">Genre</legend>
          <div className="flex flex-wrap gap-1.5">
            {genres.data?.items.map((g) => (
              <Chip
                key={g.id}
                selected={genreIds.includes(g.id)}
                onClick={() =>
                  setGenreIds((ids) => (ids.includes(g.id) ? ids.filter((x) => x !== g.id) : [...ids, g.id]))
                }
              >
                {g.name}
              </Chip>
            ))}
          </div>
          {errors.genreIds && <p className="text-[12px] text-red">{errors.genreIds}</p>}
        </fieldset>
        <Segmented
          label="Type"
          value={mediaType}
          onChange={setMediaType}
          options={[
            { value: 'movie', label: 'Movie' },
            { value: 'tv', label: 'Series' },
          ]}
          className="self-start"
        />
        {errors.root && <p className="text-[13px] text-red">{errors.root}</p>}
        <LogWatchButton icon="+" onClick={submit} disabled={create.isPending} className="self-start">
          Add and use it
        </LogWatchButton>
      </div>
    </PixelWindow>
  );
}
