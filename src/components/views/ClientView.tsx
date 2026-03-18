import { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import FilterBar from '../layout/FilterBar';
import ProgressBar from '../shared/ProgressBar';
import ExpandableRow from '../shared/ExpandableRow';
import { getAchievementTier } from '../../lib/calculations';
import type { AchievementTier, AgentMetrics } from '../../types';

interface ClientViewProps {
  selectedClients: string[];
  dateStart: string;
  dateEnd: string;
}

const gridCols = '2fr 0.8fr 0.8fr 1fr 1.5fr 0.8fr';

export default function ClientView({ selectedClients, dateStart, dateEnd }: ClientViewProps) {
  const { clients, loading } = useClients({ selectedClients, dateStart, dateEnd });
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<AchievementTier>('all');

  const filtered = clients.filter((c) => {
    if (search && !c.companyName.toLowerCase().includes(search.toLowerCase())) return false;
    if (tierFilter !== 'all' && getAchievementTier(c.cycleAchievement) !== tierFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading client data...</div>;
  }

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search clients..."
        achievementFilter={tierFilter}
        onAchievementFilterChange={setTierFilter}
      />

      <div className="dashboard-card overflow-hidden">
        <div
          className="grid items-center gap-4 px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider"
          style={{
            gridTemplateColumns: gridCols,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <span className="pl-6">Client Name</span>
          <span>Agents</span>
          <span>Appointments</span>
          <span>Total Leads</span>
          <span>Achievement</span>
          <span>Daily Avg</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-secondary">No clients match your filters.</div>
        ) : (
          filtered.map((client) => {
            const dailyAvg = client.agents.length > 0
              ? (client.agents.reduce((sum, a) => sum + a.dailyAvg, 0) / client.agents.length)
              : 0;

            return (
              <ExpandableRow
                key={client.companyId}
                gridCols={gridCols}
                cells={[
                  <span className="pill-badge">{client.companyName}</span>,
                  <span className="text-sm text-primary tabular-nums">{client.activeAgents}</span>,
                  <span className="text-sm text-primary font-semibold tabular-nums">{client.totalAppointments}</span>,
                  <span className="text-sm text-primary tabular-nums">{client.totalLeads}</span>,
                  <ProgressBar percentage={client.cycleAchievement} />,
                  <span className="text-sm text-primary tabular-nums">{dailyAvg.toFixed(2)}/day</span>,
                ]}
                expandedContent={<AgentSubTable agents={client.agents} />}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function AgentSubTable({ agents }: { agents: AgentMetrics[] }) {
  if (agents.length === 0) {
    return <div className="text-sm text-secondary py-2">No active agents in this campaign.</div>;
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
      <div
        className="grid items-center gap-4 px-4 py-2 text-xs font-semibold text-secondary uppercase tracking-wider"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.8fr',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <span>Agent Name</span>
        <span>Appointments</span>
        <span>Daily Avg</span>
        <span>Achievement</span>
        <span>Leads</span>
      </div>

      {agents.map((agent) => (
        <div
          key={agent.setterName}
          className="grid items-center gap-4 px-4 py-2.5 hover:bg-white/[0.02] transition-colors text-sm"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.8fr' }}
        >
          <span className="text-primary font-medium">{agent.setterName}</span>
          <span className="text-primary tabular-nums">{agent.appointmentsBooked}</span>
          <span className="text-primary tabular-nums">{agent.dailyAvg.toFixed(2)}/day</span>
          <ProgressBar percentage={agent.cycleAchievement} height={6} />
          <span className="text-primary tabular-nums">{agent.totalLeads}</span>
        </div>
      ))}
    </div>
  );
}
