import { useState } from 'react';
import { useAgents } from '../../hooks/useAgents';
import FilterBar from '../layout/FilterBar';
import ProgressBar from '../shared/ProgressBar';
import { formatDate } from '../../lib/dateUtils';
import { getAchievementTier } from '../../lib/calculations';
import type { AchievementTier } from '../../types';
import { ChevronRight } from 'lucide-react';

interface AgentViewProps {
  selectedClients: string[];
}

export default function AgentView({ selectedClients }: AgentViewProps) {
  const { grouped, loading } = useAgents({ selectedClients });
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<AchievementTier>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (companyId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading agent data...</div>;
  }

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search agents..."
        achievementFilter={tierFilter}
        onAchievementFilterChange={setTierFilter}
      />

      <div className="dashboard-card overflow-hidden">
        {/* Table header */}
        <div
          className="grid items-center gap-4 px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider"
          style={{
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr 0.8fr',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <span className="pl-6">Agent Name</span>
          <span>Client</span>
          <span>Cycle Start</span>
          <span>Cycle End</span>
          <span>Appointments</span>
          <span>Weekly Avg</span>
          <span>Achievement</span>
          <span>Leads</span>
        </div>

        {grouped.length === 0 ? (
          <div className="px-4 py-8 text-center text-secondary">No agents match your filters.</div>
        ) : (
          grouped.map((group) => {
            const isExpanded = expandedGroups.has(group.companyId);

            // Filter agents by search and tier
            const filteredAgents = group.agents.filter((a) => {
              if (search && !a.setterName.toLowerCase().includes(search.toLowerCase())) return false;
              if (tierFilter !== 'all' && getAchievementTier(a.cycleAchievement) !== tierFilter) return false;
              return true;
            });

            if (filteredAgents.length === 0) return null;

            return (
              <div key={group.companyId}>
                {/* Client group header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(123,47,247,0.15), rgba(0,212,255,0.08))',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onClick={() => toggleGroup(group.companyId)}
                >
                  <ChevronRight
                    size={16}
                    className={`text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                  <span className="text-primary font-semibold">{group.companyName}</span>
                  <span className="text-xs text-secondary">({filteredAgents.length} agents)</span>
                </div>

                {/* Agent rows */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {filteredAgents.map((agent) => (
                    <div
                      key={`${agent.companyId}-${agent.setterName}`}
                      className="grid items-center gap-4 px-4 py-2.5 hover:bg-white/[0.03] transition-colors text-sm border-b border-white/5"
                      style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr 0.8fr' }}
                    >
                      <span className="text-primary font-medium pl-6">{agent.setterName}</span>
                      <span className="pill-badge text-xs">{agent.companyName}</span>
                      <span className="text-primary tabular-nums">{formatDate(agent.cycleStartDate)}</span>
                      <span className="text-primary tabular-nums">{formatDate(agent.cycleEndDate)}</span>
                      <span className="text-primary font-semibold tabular-nums">{agent.appointmentsBooked}</span>
                      <span className="text-primary tabular-nums">{agent.weeklyAvg.toFixed(1)}</span>
                      <ProgressBar percentage={agent.cycleAchievement} height={6} />
                      <span className="text-primary tabular-nums">{agent.totalLeads}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
