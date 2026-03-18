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
  if (/^\d+$/.test(trimmed)) return false;
  if (trimmed.length <= 2) return false;
  return true;
}

/**
 * Achievement for a CLIENT.
 * Target = number_of_agents × business_days_elapsed (1 appt per agent per business day)
 * Achievement = (appointments / target) × 100
 */
export function clientAchievement(
  appointments: number,
  agentCount: number,
  businessDays: number
): number {
  const target = agentCount * businessDays;
  if (target === 0) return 0;
  return (appointments / target) * 100;
}

/**
 * Achievement for an AGENT.
 * Target = business_days_elapsed (1 appt per business day)
 * Achievement = (appointments / target) × 100
 */
export function agentAchievement(
  appointments: number,
  businessDays: number
): number {
  if (businessDays === 0) return 0;
  return (appointments / businessDays) * 100;
}

/**
 * Return the color for an achievement percentage tier.
 */
export function getAchievementColor(percentage: number): string {
  if (percentage > 100) return '#00d4ff';
  if (percentage >= 85) return '#22c55e';
  if (percentage >= 60) return '#eab308';
  return '#ef4444';
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
 * Daily average: appointments / business days.
 */
export function dailyAverage(appointments: number, businessDays: number): number {
  if (businessDays === 0) return 0;
  return appointments / businessDays;
}
