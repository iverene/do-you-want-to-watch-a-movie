import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton', className)} />;
}

/** Poster-shaped skeleton cards with two text lines. */
export function PosterSkeletonRow({
  count = 4,
  posterClass = 'w-[92px] h-[132px]',
}: {
  count?: number;
  posterClass?: string;
}) {
  return (
    <div role="status" aria-label="Loading" className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex shrink-0 flex-col gap-1.5">
          <Skeleton className={posterClass} />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function LineSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-4', i % 2 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
