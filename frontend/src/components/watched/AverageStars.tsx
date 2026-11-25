import type { Screening } from '@/services';
import { StarRating } from '../media/StarRating';

/** One line per card: the average of the ratings you can see (blind rating still applies). */
export function AverageStars({ s }: { s: Screening }) {
  if (s.averageStars === null)
    return (
      <span className="text-[12px] text-muted">{s.hiddenPartnerRating ? 'rate to reveal' : 'not rated'}</span>
    );
  const label = `Average ${s.averageStars} of 5`;
  return (
    <span className="flex items-center gap-1.5" title={label}>
      <StarRating value={s.averageStars} />
      <span className="text-[11px] font-bold text-muted" aria-hidden>
        {Number.isInteger(s.averageStars) ? s.averageStars : s.averageStars.toFixed(1)}
      </span>
    </span>
  );
}
