import { useClients } from '../../hooks/useClients';
import { useAgents } from '../../hooks/useAgents';
import StatCard from '../shared/StatCard';
import ProgressBar from '../shared/ProgressBar';
import { getAchievementColor } from '../../lib/calculations';
import { Building2, Users, CalendarCheck, TrendingUp, User } from 'lucide-react';

interface OverviewProps {
  selectedClients: string[];
  dateStart: string;
  dateEnd: string;
}

export default function Overview({ selectedClients, dateStart, dateEnd }: OverviewProps) {
  const { clients, loading } = useClients({ selectedClients, dateStart, dateEnd });
  const { allAgents } = useAgents({ selectedClients, dateStart, dateEnd });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading overview...</div>;
  }

  const isAllClients = selectedClients.length === 0;
  const totalClients = clients.length;
  const totalAgents = allAgents.length;
  const totalAppointments = clients.reduce((sum, c) => sum + c.totalAppointments, 0);
  const avgAchievement = totalClients > 0
    ? clients.reduce((sum, c) => sum + c.cycleAchievement, 0) / totalClients
    : 0;

  if (isAllClients) {
    const topClients = [...clients].sort((a, b) => b.cycleAchievement - a.cycleAchievement).slice(0, 10);
    const topAgents = [...allAgents].sort((a, b) => b.cycleAchievement - a.cycleAchievement).slice(0, 10);

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Active Clients" value={totalClients} subtitle="campaigns running" icon={<Building2 size={18} className="text-cyan" />} />
          <StatCard title="Active Agents" value={totalAgents} subtitle="cold callers" icon={<Users size={18} className="text-purple" />} />
          <StatCard title="Total Appointments" value={totalAppointments} subtitle="this period" icon={<CalendarCheck size={18} className="text-green-400" />} />
          <StatCard title="Avg Achievement" value={`${avgAchievement.toFixed(1)}%`} subtitle="across all clients" icon={<TrendingUp size={18} className="text-yellow-400" />} />
        </div>
        <div className="grid grid-cols-2 gap-4">
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

  // MULTI-CLIENT COMPARISON VIEW
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Selected Clients" value={totalClients} subtitle="campaigns selected" icon={<Building2 size={18} className="text-cyan" />} />
        <StatCard title="Active Agents" value={totalAgents} subtitle="across selected" icon={<Users size={18} className="text-purple" />} />
        <StatCard title="Total Appointments" value={totalAppointments} subtitle="combined" icon={<CalendarCheck size={18} className="text-green-400" />} />
        <StatCard title="Avg Achievement" value={`${avgAchievement.toFixed(1)}%`} subtitle="across selected" icon={<TrendingUp size={18} className="text-yellow-400" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {clients.map((client) => {
          const clientAgents = allAgents.filter((a) => a.companyId === client.companyId).sort((a, b) => b.appointmentsBooked - a.appointmentsBooked);
          const achieveColor = getAchievementColor(client.cycleAchievement);
          return (
            <div key={client.companyId} className="dashboard-card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-semibold text-primary">{client.companyName}</h3>
                  <span className="text-xs text-secondary">{client.activeAgents} agents &middot; {client.totalLeads} total leads</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tabular-nums" style={{ color: achieveColor }}>{client.cycleAchievement.toFixed(1)}%</div>
                  <span className="text-xs text-secondary">achievement</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-3 text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-lg font-semibold text-primary tabular-nums">{client.totalAppointments}</div>
                  <div className="text-xs text-secondary">Appointments</div>
                </div>
                <div className="px-5 py-3 text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-lg font-semibold text-primary tabular-nums">{client.activeAgents}</div>
                  <div className="text-xs text-secondary">Active Agents</div>
                </div>
                <div className="px-5 py-3 text-center">
                  <div className="text-lg font-semibold text-primary tabular-nums">{client.totalLeads}</div>
                  <div className="text-xs text-secondary">Total Leads</div>
                </div>
              </div>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <ProgressBar percentage={client.cycleAchievement} height={8} />
              </div>
              <div className="px-5 py-3">
                <div className="text-xs text-secondary uppercase tracking-wider mb-2">Agents</div>
                <div className="flex flex-col gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {clientAgents.map((agent) => (
                    <div key={agent.setterName} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <User size={12} className="text-secondary flex-shrink-0" />
                        <span className="text-sm text-primary truncate">{agent.setterName}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-secondary tabular-nums">{agent.appointmentsBooked} appts</span>
                        <span className="text-xs font-medium tabular-nums" style={{ color: getAchievementColor(agent.cycleAchievement), minWidth: '44px', textAlign: 'right' }}>
                          {agent.cycleAchievement.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {clientAgents.length === 0 && <span className="text-xs text-secondary">No active agents</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
