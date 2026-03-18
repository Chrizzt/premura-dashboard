export interface Appointment {
  id: string;
  company_id: string;
  name: string | null;
  closer_name: string | null;
  booked_for: string | null;
  confirmation_disposition: string | null;
  note: string | null;
  phone_number: string | null;
  address: string | null;
  setter_name: string | null;
  email: string | null;
  disposition_date: string | null;
  site_survey: string | null;
  m1_commission: number | null;
  m2_commission: number | null;
  contact_link: string | null;
  recording_media_link: string | null;
  credit_score: string | null;
  roof_type: string | null;
  existing_solar: string | null;
  shading: string | null;
  appointment_type: string | null;
  confirmed: boolean | null;
  contact_id: string | null;
  created_at: string;
  updated_at: string;
  dq_reason: string | null;
  system_size: string | null;
  "Company Name": string | null;
}

export interface ClientSeat {
  id: string;
  company_id: string;
  company_name: string;
  seat_count: number;
  cycle_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMetrics {
  companyId: string;
  companyName: string;
  activeAgents: number;
  totalAppointments: number;
  cycleAchievement: number;
  totalLeads: number;
  agents: AgentMetrics[];
}

export interface AgentMetrics {
  setterName: string;
  companyId: string;
  companyName: string;
  appointmentsBooked: number;
  dailyAvg: number;
  cycleAchievement: number;
  totalLeads: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  companyName?: string;
  achievement: number;
  appointments: number;
  seats?: number;
  weeklyAvg?: number;
}

export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}

export interface HistoricalCell {
  count: number;
  achievement: number;
}

export type AchievementTier = 'blue' | 'green' | 'yellow' | 'red' | 'all';
export type TimeFilter = 'week' | 'month' | 'cycle' | 'all';
export type ViewMode = 'weekly' | 'monthly';
