import { useStreak } from '@/queries/home';
import { cn } from '@/lib/cn';
import { Skeleton } from '../ui/Skeleton';
import { Flame } from './Flame';

/** R16: weeks in a row with a shared watch, plus the last 8 weeks as blocks. */
export function StreakCard({ className }: { className?: string }) {
  const streak = useStreak();
  if (streak.isPending) return <Skeleton className={cn('h-[104px]', className)} />;
  if (streak.isError) return null;
  const { current, lastWeeks } = streak.data;
  const filled = lastWeeks.filter(Boolean).length;
  return (
    <section
      aria-label="Streak"
      className={cn(
        'flex flex-col gap-2 border-2 border-pixel-border bg-yellow p-3 text-ink shadow-card',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Flame lit={current > 0} scale={3} />
        <div className="min-w-0">
          {current > 0 ? (
            <>
              <p className="font-pixel text-[20px] leading-tight">{current}-week streak</p>
              <p className="text-[12px]">watched together every week</p>
            </>
          ) : (
            <p className="text-[13px] font-bold">Start a streak: watch something together this week.</p>
          )}
        </div>
      </div>
      <div className="flex gap-1" role="img" aria-label={`${filled} of the last 8 weeks had a shared watch`}>
        {lastWeeks.map((on, i) => (
          <span
            key={i}
            className={cn('h-[14px] w-[14px] border border-pixel-border', on ? 'bg-orange' : 'bg-paper')}
          />
        ))}
      </div>
    </section>
  );
}
