import { useFavorite } from '@/hooks/useFavorites';
import { formatDotted } from '@/lib/dates';
import { useSession } from '@/queries/auth';
import { useProfile, useSetTopFive } from '@/queries/profile';
import { errorMessage, type Screening } from '@/services';
import { ArrowLink } from '../ui/ArrowLink';
import { PixelIconButton } from '../ui/PixelIconButton';
import { Tag } from '../ui/Tag';
import { useToast } from '../ui/Toast';

export function DetailTopRow({ s }: { s: Screening }) {
  const { user } = useSession();
  const [fav, toggleFav] = useFavorite(user.id, s.title.id);
  const profile = useProfile(user.username);
  const setTop = useSetTopFive(user.username);
  const toast = useToast();
  const slots = profile.data?.topFive ?? [];
  const inTop = slots.some((x) => x?.title.id === s.title.id);
  const canTop = s.viewerIds.includes(user.id);

  const addTop = () => {
    const ids = [0, 1, 2, 3, 4].map((i) => slots[i]?.id ?? null);
    const free = ids.indexOf(null);
    if (free < 0) return toast.show('Your Top 5 is full. Edit it on your profile.', 'info');
    ids[free] = s.id;
    setTop.mutate(ids, {
      onSuccess: () => toast.show(`${s.title.title} is #${free + 1} in your Top 5`),
      onError: (e) => toast.show(errorMessage(e), 'error'),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ArrowLink to="/watched">Back to Watched</ArrowLink>
      <Tag variant="note" className="ml-1 px-2 text-[12px] leading-[22px]">
        No.{s.number} ({s.watchedOn ? formatDotted(s.watchedOn) : s.watchedYear})
      </Tag>
      <span className="ml-auto flex gap-2">
        <PixelIconButton
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={fav}
          tone={fav ? 'orange' : 'yellow'}
          onClick={toggleFav}
        >
          {fav ? '♥' : '♡'}
        </PixelIconButton>
        {canTop && (
          <PixelIconButton
            aria-label={inTop ? 'In your Top 5' : 'Add to Top 5'}
            aria-pressed={inTop}
            tone={inTop ? 'orange' : 'yellow'}
            disabled={inTop || setTop.isPending}
            onClick={addTop}
          >
            ★
          </PixelIconButton>
        )}
      </span>
    </div>
  );
}
