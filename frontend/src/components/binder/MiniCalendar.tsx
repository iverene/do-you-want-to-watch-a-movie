import { addMonths, format, getDay, getDaysInMonth, parseISO } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { formatLong, todayIn } from '@/lib/dates';
import { useCalendar } from '@/queries/screenings';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** This month at a glance: orange days are days you watched something. Opens the full calendar. */
export function MiniCalendar() {
  const today = todayIn();
  const [month, setMonth] = useState(today.slice(0, 7));
  const cal = useCalendar(month, 'mine');
  const first = parseISO(`${month}-01`);
  const watched = new Map((cal.data?.days ?? []).map((d) => [d.date, d.screenings.length]));
  const cells = [
    ...Array.from({ length: getDay(first) }, () => null),
    ...Array.from({ length: getDaysInMonth(first) }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ];
  const go = (delta: number) => setMonth(format(addMonths(first, delta), 'yyyy-MM'));
  const nav =
    'flex h-7 w-7 items-center justify-center rounded border border-line bg-paper text-[11px] hover:bg-sky';

  return (
    <section aria-label="This month" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button type="button" className={nav} aria-label="Previous month" onClick={() => go(-1)}>
          ◀
        </button>
        <Link
          to={`/watched/calendar?scope=mine&month=${month}`}
          className="font-pixel text-[15px] hover:underline"
        >
          {format(first, 'MMMM yyyy')}
        </Link>
        <button
          type="button"
          className={nav}
          aria-label="Next month"
          disabled={month >= today.slice(0, 7)}
          onClick={() => go(1)}
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-[3px] text-center">
        {DOW.map((d, i) => (
          <span key={i} aria-hidden className="font-caps text-[9px] text-muted">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const n = watched.get(date) ?? 0;
          const label = `${formatLong(date)}${n ? `: ${n} watched` : ''}`;
          const cls = cn(
            'flex aspect-square items-center justify-center rounded-[3px] text-[11px]',
            n ? 'bg-orange font-bold text-pixel-text' : 'text-muted',
            date === today && 'ring-2 ring-tab',
          );
          return n ? (
            <Link
              key={date}
              to={`/watched/calendar?scope=mine&month=${month}`}
              aria-label={label}
              className={cn(cls, 'hover:brightness-95')}
            >
              {Number(date.slice(8))}
            </Link>
          ) : (
            <span key={date} aria-label={label} className={cls}>
              {Number(date.slice(8))}
            </span>
          );
        })}
      </div>
      <p className="text-[11px] text-muted">
        {watched.size} {watched.size === 1 ? 'day' : 'days'} with a watch this month
      </p>
    </section>
  );
}
