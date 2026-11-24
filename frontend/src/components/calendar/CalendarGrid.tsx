import { getDaysInMonth, getDay, parseISO } from 'date-fns';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { formatLong } from '@/lib/dates';
import type { CalendarDay } from '@/services';
import { Poster } from '../media/Poster';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Month grid: the latest title's poster fills a day; several titles stack with a count badge. */
export function CalendarGrid({ month, days, today }: { month: string; days: CalendarDay[]; today: string }) {
  const navigate = useNavigate();
  const [openDay, setOpenDay] = useState<string | null>(null);
  const first = parseISO(`${month}-01`);
  const lead = getDay(first);
  const count = getDaysInMonth(first);
  const byDate = new Map(days.map((d) => [d.date, d.screenings]));
  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div role="group" aria-label="Watch calendar" className="grid grid-cols-7 gap-1 lg:gap-1.5">
        <div className="contents">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              aria-hidden
              className={cn(
                'pb-1 text-center font-caps text-[11px]',
                i === 0 ? 'text-red' : i === 6 ? 'text-tab' : 'text-muted',
              )}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="contents">
          {cells.map((d, i) => {
            if (d === null) return <div key={`pad-${i}`} aria-hidden />;
            const date = `${month}-${String(d).padStart(2, '0')}`;
            const list = byDate.get(date) ?? [];
            const isToday = date === today;
            const label = list.length
              ? `${formatLong(date)}: ${list.map((s) => s.title.title).join(', ')}`
              : `${formatLong(date)}: nothing watched`;
            const chip = (
              <span
                className={cn(
                  'absolute bottom-1 left-1 z-10 bg-white px-1 font-caps text-[11px] leading-[14px] text-[#2E2E33]',
                  !list.length && 'bg-transparent text-muted',
                )}
              >
                {d}
              </span>
            );
            if (!list.length) {
              return (
                <div
                  key={date}
                  role="img"
                  aria-label={label}
                  className={cn(
                    'relative h-[58px] border border-dashed border-dot lg:h-[84px]',
                    isToday && 'border-2 border-solid border-tab',
                  )}
                >
                  {chip}
                </div>
              );
            }
            const latest = list[0];
            return (
              <div key={date} className="relative">
                <button
                  type="button"
                  aria-label={label}
                  aria-haspopup={list.length > 1 ? 'dialog' : undefined}
                  onClick={() =>
                    list.length === 1
                      ? navigate(`/watched/${latest.id}`)
                      : setOpenDay(openDay === date ? null : date)
                  }
                  className={cn(
                    'relative block h-[58px] w-full overflow-hidden border-2 border-[#9AA0AA] lg:h-[84px]',
                    isToday && 'border-tab',
                    list.length > 1 && 'shadow-[3px_3px_0_var(--line)]',
                  )}
                >
                  <Poster
                    title={latest.title.title}
                    posterUrl={latest.title.posterUrl}
                    tintKey={latest.title.id}
                    className="absolute inset-0 h-full w-full border-0"
                    decorative
                  />
                  {chip}
                  {list.length > 1 && (
                    <span className="absolute right-0.5 top-0.5 z-10 min-w-[18px] rounded-sm bg-orange px-1 font-caps text-[11px] leading-[16px] text-pixel-text">
                      {list.length}
                    </span>
                  )}
                </button>
                {openDay === date && (
                  <div
                    role="dialog"
                    aria-label={`Watched on ${formatLong(date)}`}
                    className="absolute left-0 top-full z-20 mt-1 w-56 border-2 border-[#9AA0AA] bg-paper p-2 shadow-window"
                  >
                    <ul className="flex flex-col">
                      {list.map((s) => (
                        <li key={s.id}>
                          <Link
                            to={`/watched/${s.id}`}
                            className="flex min-h-11 items-center gap-2 text-[13px] font-bold hover:underline"
                          >
                            <Poster
                              title={s.title.title}
                              posterUrl={s.title.posterUrl}
                              tintKey={s.title.id}
                              className="w-7"
                              decorative
                            />
                            {s.title.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mt-1 text-[12px] text-link underline"
                      onClick={() => setOpenDay(null)}
                    >
                      close
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
