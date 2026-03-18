import {
  startOfDay,
  differenceInCalendarDays,
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  isAfter,
  isBefore,
  isEqual,
  eachDayOfInterval,
  isWeekend,
  min,
} from 'date-fns';

/**
 * Working week runs Friday (day 5) to Thursday (day 4).
 */
export function getWorkingWeekStart(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const daysSinceFriday = (day + 2) % 7;
  return addDays(d, -daysSinceFriday);
}

export function getWorkingWeekEnd(date: Date): Date {
  return addDays(getWorkingWeekStart(date), 6);
}

/**
 * Count elapsed working weeks (Fri–Thu) from cycle start to today.
 */
export function getElapsedWorkingWeeks(cycleStartDate: Date): number {
  const today = startOfDay(new Date());
  const start = startOfDay(cycleStartDate);
  if (isAfter(start, today)) return 0;
  const totalDays = differenceInCalendarDays(today, start) + 1;
  return Math.max(Math.ceil(totalDays / 7), 1);
}

/**
 * Count business days (Mon-Fri) between two dates, inclusive.
 * Caps the end date to today so we never count future business days.
 */
export function getBusinessDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = startOfDay(typeof startDate === 'string' ? new Date(startDate) : startDate);
  const today = startOfDay(new Date());
  const rawEnd = startOfDay(typeof endDate === 'string' ? new Date(endDate) : endDate);
  const end = min([rawEnd, today]);

  if (isAfter(start, end)) return 0;

  const days = eachDayOfInterval({ start, end });
  return days.filter((d) => !isWeekend(d)).length;
}

/**
 * Generate working week ranges between two dates.
 */
export function getWorkingWeeks(from: Date, to: Date): { start: Date; end: Date; label: string }[] {
  const weeks: { start: Date; end: Date; label: string }[] = [];
  let current = getWorkingWeekStart(from);
  while (isBefore(current, to) || isEqual(current, to)) {
    const end = addDays(current, 6);
    weeks.push({
      start: current,
      end,
      label: `${format(current, 'MMM d')} – ${format(end, 'MMM d')}`,
    });
    current = addDays(current, 7);
  }
  return weeks;
}

/**
 * Generate month ranges between two dates.
 */
export function getMonthRanges(from: Date, to: Date): { start: Date; end: Date; label: string }[] {
  const months = eachMonthOfInterval({ start: from, end: to });
  return months.map((m) => ({
    start: startOfMonth(m),
    end: endOfMonth(m),
    label: format(m, 'MMM yyyy'),
  }));
}

export function getCycleEndDate(cycleStartDate: Date): Date {
  return addDays(cycleStartDate, 30);
}

export function formatDate(date: Date | string, fmt: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}

export function isInRange(date: Date | string, start: Date, end: Date): boolean {
  const d = startOfDay(typeof date === 'string' ? new Date(date) : date);
  const s = startOfDay(start);
  const e = startOfDay(end);
  return (isAfter(d, s) || isEqual(d, s)) && (isBefore(d, e) || isEqual(d, e));
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
