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
} from 'date-fns';

/**
 * Working week runs Friday (day 5) to Thursday (day 4).
 * Given a date, returns the Friday that starts its working week.
 */
export function getWorkingWeekStart(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
  // How many days since the most recent Friday?
  const daysSinceFriday = (day + 2) % 7; // Fri=0, Sat=1, Sun=2, Mon=3, Tue=4, Wed=5, Thu=6
  return addDays(d, -daysSinceFriday);
}

/**
 * Returns the Thursday that ends the working week containing `date`.
 */
export function getWorkingWeekEnd(date: Date): Date {
  const weekStart = getWorkingWeekStart(date);
  return addDays(weekStart, 6);
}

/**
 * Count how many complete working weeks (Fri–Thu) have elapsed
 * since cycleStartDate up to today. Partial current week counts as 1.
 */
export function getElapsedWorkingWeeks(cycleStartDate: Date): number {
  const today = startOfDay(new Date());
  const start = startOfDay(cycleStartDate);

  if (isAfter(start, today)) return 0;

  const totalDays = differenceInCalendarDays(today, start) + 1;
  const weeks = Math.ceil(totalDays / 7);
  return Math.max(weeks, 1);
}

/**
 * Generate an array of working week ranges between two dates.
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

/**
 * Cycle end date = cycle start + 30 days.
 */
export function getCycleEndDate(cycleStartDate: Date): Date {
  return addDays(cycleStartDate, 30);
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string, fmt: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}

/**
 * Check if a date falls within a range (inclusive).
 */
export function isInRange(date: Date | string, start: Date, end: Date): boolean {
  const d = startOfDay(typeof date === 'string' ? new Date(date) : date);
  const s = startOfDay(start);
  const e = startOfDay(end);
  return (isAfter(d, s) || isEqual(d, s)) && (isBefore(d, e) || isEqual(d, e));
}
