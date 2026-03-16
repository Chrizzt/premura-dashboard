import { useMemo } from 'react';
import type { ClientMetrics, AgentMetrics, LeaderboardEntry, TimeFilter } from '../types';

export function useLeaderboard(
  clients: ClientMetrics[],
  allAgents: AgentMetrics[],
  _timeFilter: TimeFilter = 'cycle'
) {
  const topClients = useMemo<LeaderboardEntry[]>(() => {
    return clients
      .map((c) => ({
        rank: 0,
        name: c.companyName,
        achievement: c.cycleAchievement,
        appointments: c.totalAppointments,
        seats: c.seatCount,
      }))
      .sort((a, b) => b.achievement - a.achievement)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [clients]);

  const topAgents = useMemo<LeaderboardEntry[]>(() => {
    return allAgents
      .map((a) => ({
        rank: 0,
        name: a.setterName,
        companyName: a.companyName,
        achievement: a.cycleAchievement,
        appointments: a.appointmentsBooked,
        weeklyAvg: a.weeklyAvg,
      }))
      .sort((a, b) => b.achievement - a.achievement)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [allAgents]);

  return { topClients, topAgents };
}
