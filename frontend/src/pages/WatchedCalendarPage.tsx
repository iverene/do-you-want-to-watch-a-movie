import { addMonths, format, parseISO } from 'date-fns';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tag } from '@/components/ui/Tag';
import { ScopeSwitch } from '@/components/watched/ScopeSwitch';
import { WatchedHeader } from '@/components/watched/WatchedHeader';
import { useScope } from '@/hooks/useScope';
import { todayIn } from '@/lib/dates';
import { plural } from '@/lib/format';
import { useCalendar } from '@/queries/screenings';

export default function WatchedCalendarPage() {
  const [scope] = useScope();
  const [params, setParams] = useSearchParams();
  const today = todayIn();
  const month = /^\d{4}-\d{2}$/.test(params.get('month') ?? '') ? params.get('month')! : today.slice(0, 7);
  const cal = useCalendar(month, scope);
  const touch = useRef<number | null>(null);

  const go = (delta: number) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.set('month', format(addMonths(parseISO(`${month}-01`), delta), 'yyyy-MM'));
        return next;
      },
      { replace: true },
    );
  const year = month.slice(0, 4);
  const navBtn = 'bevel h-11 w-11 rounded text-[12px] lg:h-8 lg:w-8';

  return (
    <div
      className="flex flex-col gap-4"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <WatchedHeader view="calendar" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ScopeSwitch />
        <div className="flex items-center gap-2">
          <button type="button" className={navBtn} aria-label="Previous month" onClick={() => go(-1)}>
            ◀
          </button>
          <p aria-live="polite" className="min-w-[96px] text-center font-pixel text-[18px]">
            {year} . {month.slice(5)}
          </p>
          <button type="button" className={navBtn} aria-label="Next month" onClick={() => go(1)}>
            ▶
          </button>
        </div>
      </div>
      {cal.isPending ? (
        <div role="status" aria-label="Loading" className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} className="h-[58px] lg:h-[84px]" />
          ))}
        </div>
      ) : cal.isError ? (
        <ErrorState error={cal.error} onRetry={() => void cal.refetch()} />
      ) : (
        <>
          <CalendarGrid month={month} days={cal.data.days} today={today} />
          {cal.data.days.length === 0 && (
            <p className="font-hand text-[17px] text-muted">no watches this month.. yet.</p>
          )}
          {cal.data.undatedCount > 0 && (
            <p className="flex flex-wrap items-center gap-2 text-[13px]">
              <Tag>NO DATE</Tag>
              {plural(cal.data.undatedCount, 'imported title')} from {year}{' '}
              {cal.data.undatedCount === 1 ? "isn't" : "aren't"} on the calendar.
              <ArrowLink to={`/watched?scope=${encodeURIComponent(scope)}&year=${year}#undated-${year}`}>
                See them in the list
              </ArrowLink>
            </p>
          )}
        </>
      )}
    </div>
  );
}
