import { useLogWatch } from '@/app/LogWatchContext';
import { runtime, typeLabel } from '@/lib/format';
import { useLike } from '@/queries/likes';
import { useCreateScreening } from '@/queries/screenings';
import { useAddToWatchlist, useWatchlist } from '@/queries/watchlist';
import { errorMessage, type Title } from '@/services';
import { FramedPoster } from '../media/FramedPoster';
import { BevelButton } from '../ui/BevelButton';
import { ChipLabel } from '../ui/Chip';
import { PixelIconButton } from '../ui/PixelIconButton';
import { useToast } from '../ui/Toast';
import { PixelWindow } from './PixelWindow';

/** A title's card: what it is, plus ♡, add to the watchlist, or log it as watched. */
export function TitlePreview({
  title: t,
  note,
  onClose,
}: {
  title: Title;
  note?: string;
  onClose: () => void;
}) {
  const like = useLike(t);
  const list = useWatchlist({});
  const add = useAddToWatchlist();
  const watch = useCreateScreening();
  const toast = useToast();
  const { open } = useLogWatch();
  const onList = add.isSuccess || Boolean(list.data?.items.some((w) => w.title.id === t.id));
  const meta = [
    typeLabel(t.mediaType),
    t.year,
    t.genres.map((g) => g.name).join(', '),
    runtime(t.runtimeMinutes),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PixelWindow title={t.title} onClose={onClose} width="lg:w-[640px]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <FramedPoster
          title={t.title}
          posterUrl={t.posterUrl}
          tintKey={t.id}
          className="w-[130px] self-center sm:self-start"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-pixel text-[22px] leading-tight">{t.title}</h3>
            <PixelIconButton
              aria-label={like.liked ? 'Unlike' : 'Like'}
              aria-pressed={like.liked}
              tone={like.liked ? 'orange' : 'yellow'}
              onClick={like.toggle}
            >
              {like.liked ? '♥' : '♡'}
            </PixelIconButton>
          </div>
          <p className="text-[12px] text-muted">{meta}</p>
          {note && <p className="font-hand text-[17px]">{note}</p>}
          {t.overview && <p className="text-[14px]">{t.overview}</p>}
          {t.cast.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {t.cast.slice(0, 4).map((p) => (
                <ChipLabel key={p.id}>{p.name}</ChipLabel>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <BevelButton
              dense
              disabled={onList || add.isPending}
              onClick={() =>
                add.mutate(t.id, {
                  onSuccess: () => toast.show(`${t.title} is on the watchlist`),
                  onError: (e) => toast.show(errorMessage(e), 'error'),
                })
              }
            >
              {onList ? '✓ On the watchlist' : '+ Add to watchlist'}
            </BevelButton>
            <BevelButton
              dense
              disabled={watch.isPending}
              onClick={() =>
                watch.mutate(
                  { titleId: t.id },
                  {
                    onSuccess: ({ screening }) => {
                      onClose();
                      open({ mode: 'rate', screening, justSaved: true });
                    },
                    onError: (e) => toast.show(errorMessage(e), 'error'),
                  },
                )
              }
            >
              ✓ Mark as watched
            </BevelButton>
          </div>
        </div>
      </div>
    </PixelWindow>
  );
}
