import { useState } from 'react';
import { useAgents } from '../../hooks/useAgents';
import FilterBar from '../layout/FilterBar';
import ProgressBar from '../shared/ProgressBar';
import { getAchievementTier } from '../../lib/calculations';
import type { AchievementTier } from '../../types';

interface AgentViewProps {
  selectedClients: string[];
  dateStart: string;
  dateEnd: string;
}

export default function AgentView({ selectedClients, dateStart, dateEnd }: AgentViewProps) {
  const { allAgents, loading } = useAgents({ selectedClients, dateStart, dateEnd });
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<AchievementTier>('all');

  const filtered = allAgents.filter((a) => {
    if (search) {
      const term = search.toLowerCase();
      if (!a.setterName.toLowerCase().includes(term) && !a.companyName.toLowerCase().includes(term)) return false;
    }
    if (tierFilter !== 'all' && getAchievementTier(a.cycleAchievement) !== tierFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading agent data...</div>;
  }

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search agents or clients..."
        achievementFilter={tierFilter}
        onAchievementFilterChange={setTierFilter}
      />

      <div className="dashboard-card overflow-hidden">
        {/* Table header */}
        <div
          className="grid items-center gap-4 px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.8fr',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <span>Agent</span>
          <span>Appointments</span>
          <span>Daily Avg</span>
          <span>Achievement</span>
          <span>Leads</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-secondary">No agents match your filters.</div>
        ) : (
          filtered.map((agent) => (
            <div
              key={`${agent.companyId}-${agent.setterName}`}
              className="grid items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/5"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.8fr' }}
            >
              {/* Agent name on first line, client on second line */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-primary font-medium">{agent.setterName}</span>
                <span className="pill-badge text-xs w-fit">{agent.companyName}</span>
              </div>
              <span className="text-sm text-primary font-semibold tabular-nums">{agent.appointmentsBooked}</span>
              <span className="text-sm text-primary tabular-nums">{agent.dailyAvg.toFixed(2)}/day</span>
              <ProgressBar percentage={agent.cycleAchievement} height={6} />
              <span className="text-sm text-primary tabular-nums">{agent.totalLeads}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
