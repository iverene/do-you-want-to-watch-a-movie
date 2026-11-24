import { cn } from '@/lib/cn';

/** Display-only stars. Averages round for the glyphs; show the number next to them. */
export function StarRating({
  value,
  size = 12,
  className,
}: {
  value: number | null;
  size?: number;
  className?: string;
}) {
  const filled = value === null ? 0 : Math.round(value);
  const label = value === null ? 'Not rated' : `${value} of 5 stars`;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('inline-flex leading-none', className)}
      style={{ fontSize: size }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden className={i <= filled ? 'text-star' : 'text-line'}>
          ★
        </span>
      ))}
    </span>
  );
}
