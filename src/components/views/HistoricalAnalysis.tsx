import { useState } from 'react';
import { useHistorical } from '../../hooks/useHistorical';
import { getAchievementColor } from '../../lib/calculations';
import WeeklyChart from '../shared/WeeklyChart';
import MonthlyChart from '../shared/MonthlyChart';
import type { ViewMode } from '../../types';
import { ChevronRight, X } from 'lucide-react';

interface HistoricalAnalysisProps {
  selectedClients: string[];
  dateStart: string;
  dateEnd: string;
}

export default function HistoricalAnalysis({ selectedClients, dateStart, dateEnd }: HistoricalAnalysisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [slideOverClient, setSlideOverClient] = useState<string | null>(null);

  const { rows, agentRows, periodLabels, loading } = useHistorical({
    viewMode,
    dateStart,
    dateEnd,
    selectedClients,
  });

  const toggleExpand = (name: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading historical data...</div>;
  }

  const slideOverRow = slideOverClient ? rows.find((r) => r.companyId === slideOverClient) : null;

  return (
    <div className="relative">
      {/* Toggle */}
      <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        <button
          onClick={() => setViewMode('weekly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'weekly' ? 'text-white bg-gradient-to-r from-purple to-cyan' : 'text-secondary hover:text-primary'
          }`}
        >
          Weekly View
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'monthly' ? 'text-white bg-gradient-to-r from-purple to-cyan' : 'text-secondary hover:text-primary'
          }`}
        >
          Monthly View
        </button>
      </div>

      {/* Historical table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-secondary uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="text-left px-4 py-3 sticky left-0 bg-surface min-w-[200px]">Name</th>
              {periodLabels.map((label) => (
                <th key={label} className="text-center px-3 py-3 min-w-[100px] whitespace-nowrap">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isExpanded = expandedClients.has(row.name);
              const agents = row.companyId ? agentRows[row.companyId] || [] : [];

              return (
                <HistoricalGroup
                  key={row.name}
                  row={row}
                  agents={agents}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpand(row.name)}
                  onClientClick={() => setSlideOverClient(row.companyId || null)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-over panel */}
      {slideOverClient && slideOverRow && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSlideOverClient(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-[480px] h-full overflow-y-auto p-6 animate-slideIn"
            style={{ backgroundColor: '#16213e', borderLeft: '1px solid rgba(0,212,255,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-primary">{slideOverRow.name}</h2>
              <button onClick={() => setSlideOverClient(null)} className="p-1 rounded hover:bg-white/5 text-secondary">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-medium text-secondary mb-3">
                  {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Appointments
                </h3>
                {viewMode === 'weekly' ? (
                  <WeeklyChart
                    data={slideOverRow.periods.map((p) => ({
                      label: p.label,
                      appointments: p.count,
                      target: slideOverRow.seatCount * 5,
                    }))}
                  />
                ) : (
                  <MonthlyChart
                    data={slideOverRow.periods.map((p) => ({
                      label: p.label,
                      appointments: p.count,
                    }))}
                  />
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-secondary mb-3">Agent Breakdown</h3>
                {(agentRows[slideOverClient] || []).map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-primary text-sm">{agent.name}</span>
                    <span className="text-secondary text-sm tabular-nums">
                      {agent.periods.reduce((sum, p) => sum + p.count, 0)} total
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricalGroup({
  row,
  agents,
  isExpanded,
  onToggle,
  onClientClick,
}: {
  row: { name: string; periods: { count: number; achievement: number }[] };
  agents: { name: string; periods: { count: number; achievement: number }[] }[];
  isExpanded: boolean;
  onToggle: () => void;
  onClientClick: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-white/[0.02] cursor-pointer border-b border-white/5">
        <td className="px-4 py-2.5 sticky left-0 bg-surface">
          <div className="flex items-center gap-2">
            <button onClick={onToggle}>
              <ChevronRight
                size={14}
                className={`text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
            <span className="text-primary font-medium hover:text-cyan transition-colors" onClick={onClientClick}>
              {row.name}
            </span>
          </div>
        </td>
        {row.periods.map((p, i) => (
          <td key={i} className="text-center px-3 py-2.5">
            <span
              className="inline-flex items-center justify-center w-10 h-7 rounded text-xs font-semibold tabular-nums"
              style={{
                backgroundColor: `${getAchievementColor(p.achievement)}18`,
                color: getAchievementColor(p.achievement),
              }}
              title={`${p.count} appointments — ${p.achievement.toFixed(1)}% achievement`}
            >
              {p.count}
            </span>
          </td>
        ))}
      </tr>

      {isExpanded &&
        agents.map((agent) => (
          <tr key={agent.name} className="bg-black/10 border-b border-white/[0.02]">
            <td className="px-4 py-2 pl-12 sticky left-0 bg-surface/80 text-secondary text-sm">
              {agent.name}
            </td>
            {agent.periods.map((p, i) => (
              <td key={i} className="text-center px-3 py-2">
                <span
                  className="inline-flex items-center justify-center w-8 h-6 rounded text-xs tabular-nums"
                  style={{
                    backgroundColor: p.count > 0 ? `${getAchievementColor(p.achievement)}12` : 'transparent',
                    color: p.count > 0 ? getAchievementColor(p.achievement) : '#64748b',
                  }}
                >
                  {p.count}
                </span>
              </td>
            ))}
          </tr>
        ))}
    </>
  );
}
