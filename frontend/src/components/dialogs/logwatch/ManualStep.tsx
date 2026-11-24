import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGenres } from '@/queries/browse';
import { useCreateManual } from '@/queries/movies';
import { errorMessage, isApiError, type MediaType } from '@/services';
import { ArrowButton } from '../../ui/ArrowLink';
import { Chip } from '../../ui/Chip';
import { Field, TextArea, TextInput } from '../../ui/Field';
import { LogWatchButton } from '../../ui/LogWatchButton';
import { Segmented } from '../../ui/Segmented';
import { PosterPicker } from './PosterPicker';
import { initialDetails, WatchDetails } from './WatchDetails';
import { useSaveWatch } from './useSaveWatch';

export const manualSchema = z.object({
  title: z.string().trim().min(1, 'Add a title.').max(200),
  genreIds: z.array(z.string()).min(1, 'Pick at least one genre.'),
  mediaType: z.enum(['movie', 'tv']),
  year: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || (/^\d{4}$/.test(v) && Number(v) >= 1888 && Number(v) <= 2100),
      'Use a 4-digit year.',
    ),
  overview: z.string().max(500, 'Keep it under 500 characters.'),
  posterUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\//.test(v), 'Use an image link (https://…).'),
});
export type ManualForm = z.infer<typeof manualSchema>;

export function ManualStep({
  mode,
  onBack,
  onDirty,
}: {
  mode: 'log' | 'watchlist';
  onBack: () => void;
  onDirty: (d: boolean) => void;
}) {
  const genres = useGenres();
  const createTitle = useCreateManual();
  const [poster, setPoster] = useState<File | null>(null);
  const [details, setDetails] = useState(initialDetails);
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});
  const form = useForm<ManualForm>({
    resolver: zodResolver(manualSchema),
    defaultValues: { title: '', genreIds: [], mediaType: 'movie', year: '', overview: '', posterUrl: '' },
  });
  const { register, handleSubmit, control, formState, setError, watch } = form;
  const mediaType = watch('mediaType');
  const { save, pending } = useSaveWatch(mode, setDetailErrors);

  const onSubmit = (v: ManualForm) =>
    createTitle.mutate(
      {
        title: v.title,
        genreIds: v.genreIds,
        mediaType: v.mediaType as MediaType,
        year: v.year ? Number(v.year) : undefined,
        overview: v.overview || undefined,
        poster: poster ?? undefined,
        posterUrl: poster ? undefined : v.posterUrl || undefined,
      },
      {
        onSuccess: ({ title }) => save(title, { ...details, season: '' }),
        onError: (e) => {
          if (isApiError(e) && e.fields) {
            for (const [k, msg] of Object.entries(e.fields)) {
              const name = (k === 'poster' ? 'posterUrl' : k) as keyof ManualForm;
              setError(name in manualSchema.shape ? name : 'root', { message: msg });
            }
          } else setError('root', { message: errorMessage(e) });
        },
      },
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => onDirty(true)}
      noValidate
      className="flex flex-col gap-5 lg:flex-row"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <ArrowButton onClick={onBack} className="self-start">
          Back to search
        </ArrowButton>
        <PosterPicker
          file={poster}
          onFile={setPoster}
          urlProps={register('posterUrl')}
          urlError={formState.errors.posterUrl?.message}
        />
        <Field label="Title" note="required" error={formState.errors.title?.message}>
          {(a) => <TextInput {...a} {...register('title')} data-autofocus />}
        </Field>
        <Controller
          control={control}
          name="genreIds"
          render={({ field, fieldState }) => (
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1 text-[13px] font-extrabold">
                Genre <span className="font-normal text-muted">required, 1 or more</span>
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {genres.data?.items.map((g) => {
                  const on = field.value.includes(g.id);
                  return (
                    <Chip
                      key={g.id}
                      selected={on}
                      onClick={() => {
                        field.onChange(on ? field.value.filter((x) => x !== g.id) : [...field.value, g.id]);
                        onDirty(true);
                      }}
                    >
                      {g.name}
                    </Chip>
                  );
                })}
              </div>
              {fieldState.error && <p className="text-[12px] text-red">{fieldState.error.message}</p>}
            </fieldset>
          )}
        />
        <div className="flex flex-wrap gap-3">
          <Field label="Year" note="optional" error={formState.errors.year?.message} className="w-28">
            {(a) => <TextInput {...a} {...register('year')} inputMode="numeric" maxLength={4} />}
          </Field>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-extrabold">Type</span>
            <Controller
              control={control}
              name="mediaType"
              render={({ field }) => (
                <Segmented
                  label="Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'movie', label: 'Movie' },
                    { value: 'tv', label: 'Series' },
                  ]}
                />
              )}
            />
          </div>
        </div>
        <Field label="Short description" note="optional" error={formState.errors.overview?.message}>
          {(a) => <TextArea {...a} {...register('overview')} className="font-body text-[14px]" />}
        </Field>
        {formState.errors.root && (
          <p role="alert" className="text-[13px] text-red">
            {formState.errors.root.message}
          </p>
        )}
      </div>
      <aside
        aria-label="Watch details"
        className="flex flex-col gap-4 border-t border-line pt-4 lg:w-[280px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
      >
        {mode === 'log' && (
          <WatchDetails
            title={{ mediaType: mediaType as MediaType, seasons: null }}
            value={details}
            onChange={setDetails}
            errors={detailErrors}
          />
        )}
        <LogWatchButton
          type="submit"
          icon={mode === 'log' ? '▶' : '+'}
          disabled={createTitle.isPending || pending}
        >
          {mode === 'log' ? 'Save & rate' : 'Add to watchlist'}
        </LogWatchButton>
      </aside>
    </form>
  );
}
