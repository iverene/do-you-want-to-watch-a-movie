import { Link } from 'react-router-dom';
import { useLogWatch } from '@/app/LogWatchContext';
import { formatShort } from '@/lib/dates';
import { typeLabel } from '@/lib/format';
import { useSession } from '@/queries/auth';
import type { Screening } from '@/services';
import { CommentIcon } from '../comments/CommentIcon';
import { Poster } from '../media/Poster';
import { UserStars } from './UserStars';

export function ScreeningCard({ s }: { s: Screening }) {
  const { user } = useSession();
  const { open } = useLogWatch();
  const canRate = s.viewerIds.includes(user.id) && !s.ratings.some((r) => r.userId === user.id);
  return (
    <div className="flex w-[112px] flex-col gap-1 max-[400px]:w-[96px]">
      <Link to={`/watched/${s.id}`} className="group flex flex-col gap-1">
        <span className="relative block">
          <Poster
            title={s.title.title}
            posterUrl={s.title.posterUrl}
            tintKey={s.title.id}
            className="w-full"
            decorative
          />
          {s.commentCount > 0 && (
            <CommentIcon
              count={s.commentCount}
              className="absolute right-1 top-1 rounded border border-line bg-paper px-1 text-[11px] text-ink"
            />
          )}
        </span>
        <span className="truncate text-[13px] font-bold group-hover:underline">{s.title.title}</span>
      </Link>
      <span className="truncate text-[12px] text-muted">
        {s.watchedOn ? formatShort(s.watchedOn) : s.watchedYear} · {typeLabel(s.title.mediaType)}
        {s.season && ` S${s.season}`}
      </span>
      <UserStars s={s} />
      {canRate && (
        <button
          type="button"
          onClick={() => open({ mode: 'rate', screening: s })}
          className="bevel min-h-9 rounded text-[12px] font-bold max-lg:min-h-11"
        >
          Rate it
        </button>
      )}
    </div>
  );
}
