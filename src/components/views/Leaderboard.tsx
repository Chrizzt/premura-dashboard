import { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { useAgents } from '../../hooks/useAgents';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import LeaderboardCard from '../shared/LeaderboardCard';
import type { TimeFilter } from '../../types';

interface LeaderboardViewProps {
  selectedClients: string[];
}

export default function LeaderboardView({ selectedClients }: LeaderboardViewProps) {
  const { clients } = useClients({ selectedClients });
  const { allAgents } = useAgents({ selectedClients });
  const [tab, setTab] = useState<'clients' | 'agents'>('clients');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('cycle');

  const { topClients, topAgents } = useLeaderboard(clients, allAgents, timeFilter);

  const timeOptions: { value: TimeFilter; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'cycle', label: 'This Cycle' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div>
      {/* Tabs + time filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setTab('clients')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === 'clients'
                ? 'text-white bg-gradient-to-r from-purple to-cyan'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Top Clients
          </button>
          <button
            onClick={() => setTab('agents')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === 'agents'
                ? 'text-white bg-gradient-to-r from-purple to-cyan'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Top Agents
          </button>
        </div>

        <div className="flex gap-1">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                timeFilter === opt.value
                  ? 'text-cyan bg-cyan/10 border border-cyan/30'
                  : 'text-secondary hover:text-primary border border-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard cards */}
      <div className="flex flex-col gap-3">
        {tab === 'clients' ? (
          topClients.length === 0 ? (
            <div className="text-center text-secondary py-12">No client data available.</div>
          ) : (
            topClients.map((entry) => (
              <LeaderboardCard key={entry.name} entry={entry} type="client" />
            ))
          )
        ) : topAgents.length === 0 ? (
          <div className="text-center text-secondary py-12">No agent data available.</div>
        ) : (
          topAgents.map((entry) => (
            <LeaderboardCard key={`${entry.name}-${entry.companyName}`} entry={entry} type="agent" />
          ))
        )}
      </div>
    </div>
  );
}
