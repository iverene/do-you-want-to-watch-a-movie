import { useSession } from '@/queries/auth';
import type { Screening } from '@/services';
import { StarRating } from '../media/StarRating';

/** "A ★★★★★ / B ★★★★☆", "solo", or a hidden partner rating (blind rating). */
export function UserStars({ s }: { s: Screening }) {
  const { users, user, partner } = useSession();
  if (s.viewerIds.length === 1) {
    const who = users.find((u) => u.id === s.viewerIds[0])!;
    const r = s.ratings.find((x) => x.userId === who.id);
    return (
      <span className="flex items-center gap-1 text-[12px]">
        <span className="font-caps text-[11px] uppercase text-muted">solo · {who.displayName}</span>
        {r && <StarRating value={r.stars} size={11} />}
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-0.5">
      {users.map((u) => {
        const r = s.ratings.find((x) => x.userId === u.id);
        const hidden = u.id === partner.id && s.hiddenPartnerRating;
        return (
          <span key={u.id} className="flex items-center gap-1 text-[12px]">
            <span className="w-3 font-bold" title={u.displayName}>
              {u.displayName[0]}
            </span>
            {r ? (
              <StarRating value={r.stars} size={11} />
            ) : hidden ? (
              <span
                className="font-caps text-[11px] text-muted"
                aria-label={`${partner.displayName}'s stars are hidden until you rate`}
              >
                ?????
              </span>
            ) : (
              <span className="text-[11px] text-muted">{u.id === user.id ? 'not rated' : '—'}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}
