import { addDays, format, parseISO, startOfISOWeek } from 'date-fns';
import { serviceConfig } from '@/services/config';

/** Today's calendar date (YYYY-MM-DD) in the given IANA time zone. */
export function todayIn(timeZone: string = serviceConfig.timeZone, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Monday (YYYY-MM-DD) of the ISO week that contains the date. */
export function weekStart(date: string): string {
  return format(startOfISOWeek(parseISO(date)), 'yyyy-MM-dd');
}

export function shiftDays(date: string, days: number): string {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

/** "Nov 22, 2026" */
export function formatLong(date: string): string {
  return format(parseISO(date), 'MMM d, yyyy');
}

/** "Nov 22" */
export function formatShort(date: string): string {
  return format(parseISO(date), 'MMM d');
}

/** "2026.11.22" for the No. label */
export function formatDotted(date: string): string {
  return format(parseISO(date), 'yyyy.MM.dd');
}

/** "November 2026" */
export function formatMonth(month: string): string {
  return format(parseISO(`${month}-01`), 'MMMM yyyy');
}

export const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
