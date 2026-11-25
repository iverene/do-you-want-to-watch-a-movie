import { cn } from '@/lib/cn';
import type { Title } from '@/services';
import { Poster } from './Poster';

/** Just the poster, as a button. The title is in the accessible name and the hover tooltip. */
export function PosterTile({
  title: t,
  onOpen,
  className = 'w-[96px] lg:w-[112px]',
  label,
}: {
  title: Title;
  onOpen: () => void;
  className?: string;
  label?: string;
}) {
  const name = label ?? `${t.title}${t.year ? ` (${t.year})` : ''}`;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={name}
      title={name}
      className={cn(
        'shrink-0 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
        className,
      )}
    >
      <Poster title={t.title} posterUrl={t.posterUrl} tintKey={t.id} className="w-full" decorative />
    </button>
  );
}
