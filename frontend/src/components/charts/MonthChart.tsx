import { cn } from '@/lib/cn';
import { MONTH_INITIALS, MONTH_NAMES } from '@/lib/dates';

/** 12 bars on a 2px ink baseline; the highlighted month is orange. */
export function MonthChart({
  counts,
  highlight,
  year,
}: {
  counts: number[];
  highlight: number | null;
  year: number;
}) {
  const max = Math.max(1, ...counts);
  return (
    <figure>
      <div
        role="img"
        aria-label={`Titles per month in ${year}: ${counts.map((c, i) => `${MONTH_NAMES[i]} ${c}`).join(', ')}`}
        className="flex h-[120px] items-end gap-1 border-b-2 border-ink lg:gap-2"
      >
        {counts.map((c, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-0.5">
            {c > 0 && <span className="text-[11px] font-bold">{c}</span>}
            <span
              className={cn('w-full border border-pixel-border', i === highlight ? 'bg-orange' : 'bg-sky')}
              style={{ height: `${(c / max) * 90}px` }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="mt-1 flex gap-1 lg:gap-2">
        {MONTH_INITIALS.map((m, i) => (
          <span
            key={i}
            className={cn(
              'flex-1 text-center font-caps text-[11px]',
              i === highlight ? 'text-orange' : 'text-muted',
            )}
          >
            {m}
          </span>
        ))}
      </div>
    </figure>
  );
}
