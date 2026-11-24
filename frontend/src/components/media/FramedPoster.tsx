import { cn } from '@/lib/cn';
import { Poster } from './Poster';

/** The hero poster: 3px grey frame, gradient mat, then the poster. */
export function FramedPoster({
  title,
  posterUrl,
  tintKey,
  className,
  mat = 'p-[6px] lg:p-2',
}: {
  title: string;
  posterUrl: string | null;
  tintKey?: string;
  className?: string;
  mat?: string;
}) {
  return (
    <div
      className={cn(
        'shrink-0 border-[3px] border-[#9AA0AA] bg-gradient-to-b from-white to-[#F7B07A]',
        mat,
        className,
      )}
    >
      <Poster title={title} posterUrl={posterUrl} tintKey={tintKey} className="w-full border-[#9AA0AA]" />
    </div>
  );
}
