import { useMemo, useState } from 'react';
import { useScreenings } from '@/queries/screenings';
import { useSetTopFive } from '@/queries/profile';
import { errorMessage, isApiError, type Screening } from '@/services';
import { Combobox } from '../ui/Combobox';
import { LogWatchButton } from '../ui/LogWatchButton';
import { LineSkeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { PixelWindow } from './PixelWindow';

/** Pick and order your Top 5 — only from titles you have watched. */
export function TopFivePicker({
  username,
  current,
  onClose,
}: {
  username: string;
  current: (Screening | null)[];
  onClose: () => void;
}) {
  const watched = useScreenings({ scope: 'mine', pageSize: 1000 });
  const save = useSetTopFive(username);
  const toast = useToast();
  const [slots, setSlots] = useState<string[]>(() => [0, 1, 2, 3, 4].map((i) => current[i]?.id ?? ''));
  const [error, setError] = useState<string | null>(null);

  // One option per title (the latest screening of it).
  const options = useMemo(() => {
    const seen = new Set<string>();
    return (watched.data?.items ?? []).filter((s) =>
      seen.has(s.title.id) ? false : (seen.add(s.title.id), true),
    );
  }, [watched.data]);
  const titleOf = (sid: string) =>
    options.find((o) => o.id === sid)?.title.id ?? current.find((c) => c?.id === sid)?.title.id;

  return (
    <PixelWindow title="Top 5" onClose={onClose} width="lg:w-[560px]">
      <p className="mb-3 text-[13px] text-muted">
        Type to find a title you&apos;ve watched. Order matters: 1 is your favorite.
      </p>
      {watched.isPending ? (
        <LineSkeleton lines={5} />
      ) : (
        <ol className="flex flex-col gap-2">
          {slots.map((sid, i) => {
            const taken = new Set(slots.filter((x, j) => x && j !== i).map(titleOf));
            return (
              <li key={i} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-pixel-border bg-yellow font-pixel text-[16px] text-pixel-text">
                  {i + 1}
                </span>
                <Combobox
                  className="flex-1"
                  label={`Number ${i + 1}`}
                  placeholder="Type a title, or leave empty"
                  value={sid}
                  onChange={(v) => setSlots((s) => s.map((x, j) => (j === i ? v : x)))}
                  options={[
                    ...options
                      .filter((o) => !taken.has(o.title.id))
                      .map((o) => ({
                        value: o.id,
                        label: `${o.title.title}${o.title.year ? ` (${o.title.year})` : ''}`,
                      })),
                  ]}
                />
              </li>
            );
          })}
        </ol>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-red">
          {error}
        </p>
      )}
      <LogWatchButton
        icon="★"
        className="mt-4"
        disabled={save.isPending || watched.isPending}
        onClick={() =>
          save.mutate(
            slots.map((s) => s || null),
            {
              onSuccess: () => {
                toast.show('Top 5 saved');
                onClose();
              },
              onError: (e) =>
                setError(
                  isApiError(e, 'VALIDATION')
                    ? 'Only titles you have watched can be in your Top 5.'
                    : errorMessage(e),
                ),
            },
          )
        }
      >
        Save Top 5
      </LogWatchButton>
    </PixelWindow>
  );
}
