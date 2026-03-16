import { useClients } from '../../hooks/useClients';
import { useAgents } from '../../hooks/useAgents';
import StatCard from '../shared/StatCard';
import ProgressBar from '../shared/ProgressBar';
import { Building2, Users, CalendarCheck, TrendingUp } from 'lucide-react';

interface OverviewProps {
  selectedClients: string[];
}

export default function Overview({ selectedClients }: OverviewProps) {
  const { clients, loading } = useClients({ selectedClients });
  const { allAgents } = useAgents({ selectedClients });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading overview...</div>;
  }

  const totalClients = clients.length;
  const totalAgents = allAgents.length;
  const totalAppointments = clients.reduce((sum, c) => sum + c.totalAppointments, 0);
  const avgAchievement = totalClients > 0
    ? clients.reduce((sum, c) => sum + c.cycleAchievement, 0) / totalClients
    : 0;

  // Top 5 clients by achievement
  const topClients = [...clients].sort((a, b) => b.cycleAchievement - a.cycleAchievement).slice(0, 5);
  // Top 5 agents by achievement
  const topAgents = [...allAgents].sort((a, b) => b.cycleAchievement - a.cycleAchievement).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Active Clients"
          value={totalClients}
          subtitle="campaigns running"
          icon={<Building2 size={18} className="text-cyan" />}
        />
        <StatCard
          title="Active Agents"
          value={totalAgents}
          subtitle="cold callers"
          icon={<Users size={18} className="text-purple" />}
        />
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          subtitle="this cycle"
          icon={<CalendarCheck size={18} className="text-green-400" />}
        />
        <StatCard
          title="Avg Achievement"
          value={`${avgAchievement.toFixed(1)}%`}
          subtitle="across all clients"
          icon={<TrendingUp size={18} className="text-yellow-400" />}
        />
      </div>

      {/* Two column: Top clients + Top agents */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Clients */}
        <div className="dashboard-card p-5">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Top Clients</h3>
          <div className="flex flex-col gap-3">
            {topClients.map((client, i) => (
              <div key={client.companyId} className="flex items-center gap-3">
                <span className="text-xs text-secondary w-5 text-right">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-primary font-medium">{client.companyName}</span>
                    <span className="text-xs text-secondary tabular-nums">{client.totalAppointments} appts</span>
                  </div>
                  <ProgressBar percentage={client.cycleAchievement} height={5} />
                </div>
              </div>
            ))}
            {topClients.length === 0 && <span className="text-secondary text-sm">No client data yet.</span>}
          </div>
        </div>

        {/* Top Agents */}
        <div className="dashboard-card p-5">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Top Agents</h3>
          <div className="flex flex-col gap-3">
            {topAgents.map((agent, i) => (
              <div key={`${agent.setterName}-${agent.companyId}`} className="flex items-center gap-3">
                <span className="text-xs text-secondary w-5 text-right">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-primary font-medium">{agent.setterName}</span>
                    <span className="pill-badge text-xs">{agent.companyName}</span>
                  </div>
                  <ProgressBar percentage={agent.cycleAchievement} height={5} />
                </div>
              </div>
            ))}
            {topAgents.length === 0 && <span className="text-secondary text-sm">No agent data yet.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
