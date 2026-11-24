import { useLogWatch } from '@/app/LogWatchContext';
import { ChipLabel } from '../ui/Chip';
import { BevelButton } from '../ui/BevelButton';
import { ArrowButton } from '../ui/ArrowLink';
import { Tag } from '../ui/Tag';
import { FramedPoster } from '../media/FramedPoster';
import { useToast } from '../ui/Toast';
import { runtime, typeLabel } from '@/lib/format';
import { useProviders } from '@/queries/movies';
import { useAddToWatchlist } from '@/queries/watchlist';
import { useCreateScreening } from '@/queries/screenings';
import { errorMessage, type Recommendation } from '@/services';

export function TopPick({ pick, onSpin }: { pick: Recommendation; onSpin?: () => void }) {
  const t = pick.title;
  const providers = useProviders(t.id);
  const add = useAddToWatchlist();
  const watch = useCreateScreening();
  const toast = useToast();
  const { open } = useLogWatch();
  const provider = providers.data?.items[0]?.name;

  const meta = [t.year, t.genres[0]?.name, runtime(t.runtimeMinutes), provider && `streaming on ${provider}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line bg-panel p-3 sm:flex-row lg:p-4">
      <FramedPoster
        title={t.title}
        posterUrl={t.posterUrl}
        tintKey={t.id}
        className="w-[120px] self-center sm:self-start"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Tag variant="note">TOP PICK</Tag>
          <span className="font-caps text-[11px] uppercase text-muted">{typeLabel(t.mediaType)}</span>
        </div>
        <h3 className="font-pixel text-[22px] leading-tight lg:text-[26px]">{t.title}</h3>
        <p className="text-[12px] text-muted lg:text-[13px]">{meta}</p>
        <p className="font-hand text-[17px] text-ink lg:text-[19px]">{pick.reason}</p>
        <div className="flex flex-wrap gap-1.5">
          <ChipLabel tone="orange">{pick.matchPercent}% match</ChipLabel>
          {t.genres.map((g) => (
            <ChipLabel key={g.id}>{g.name}</ChipLabel>
          ))}
          {t.cast[0] && <ChipLabel>{t.cast[0].name} in the cast</ChipLabel>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <BevelButton
            dense
            disabled={add.isPending || add.isSuccess}
            onClick={() =>
              add.mutate(t.id, {
                onSuccess: () => toast.show(`${t.title} is on the watchlist`),
                onError: (e) => toast.show(errorMessage(e), 'error'),
              })
            }
          >
            {add.isSuccess ? '✓ On the watchlist' : '+ Add to watchlist'}
          </BevelButton>
          <BevelButton
            dense
            disabled={watch.isPending}
            onClick={() =>
              watch.mutate(
                { titleId: t.id },
                {
                  onSuccess: ({ screening }) => open({ mode: 'rate', screening, justSaved: true }),
                  onError: (e) => toast.show(errorMessage(e), 'error'),
                },
              )
            }
          >
            ✓ Mark as watched
          </BevelButton>
          {onSpin && <ArrowButton onClick={onSpin}>Spin instead</ArrowButton>}
        </div>
      </div>
    </article>
  );
}
