import type { Appointment } from '../types';

/**
 * A valid appointment is NOT disqualified.
 * dq_reason can be null, empty string, or an actual reason.
 * Valid = dq_reason is null or empty string (no real DQ reason).
 */
export function isValidAppointment(record: Appointment): boolean {
  return !record.dq_reason || record.dq_reason.trim() === '';
}

/**
 * Check if a record has a real setter assigned (non-null, non-empty).
 */
export function hasValidSetter(record: Appointment): boolean {
  if (!record.setter_name) return false;
  const trimmed = record.setter_name.trim();
  if (trimmed === '') return false;
  // Filter out garbage data: pure numbers, single characters
  if (/^\d+$/.test(trimmed)) return false;
  if (trimmed.length <= 2) return false;
  return true;
}

/**
 * Cycle achievement for a CLIENT.
 * target = seats × 5 × elapsed working weeks
 */
export function clientCycleAchievement(
  appointments: number,
  seats: number,
  elapsedWeeks: number
): number {
  const target = seats * 5 * elapsedWeeks;
  if (target === 0) return 0;
  return (appointments / target) * 100;
}

/**
 * Cycle achievement for an AGENT (1 seat per agent).
 * target = 1 × 5 × elapsed working weeks
 */
export function agentCycleAchievement(
  appointments: number,
  elapsedWeeks: number
): number {
  const target = 5 * elapsedWeeks;
  if (target === 0) return 0;
  return (appointments / target) * 100;
}

/**
 * Return the color for an achievement percentage tier.
 */
export function getAchievementColor(percentage: number): string {
  if (percentage > 100) return '#00d4ff'; // cyan — above target
  if (percentage >= 85) return '#22c55e';  // green
  if (percentage >= 60) return '#eab308';  // yellow
  return '#ef4444';                         // red
}

/**
 * Return the tier name for an achievement percentage.
 */
export function getAchievementTier(percentage: number): 'blue' | 'green' | 'yellow' | 'red' {
  if (percentage > 100) return 'blue';
  if (percentage >= 85) return 'green';
  if (percentage >= 60) return 'yellow';
  return 'red';
}

/**
 * Calculate weekly average: appointments / elapsed weeks.
 */
export function weeklyAverage(appointments: number, elapsedWeeks: number): number {
  if (elapsedWeeks === 0) return 0;
  return appointments / elapsedWeeks;
}
