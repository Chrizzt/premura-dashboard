import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  viewLabel: string;
  isLive: boolean;
  onRefresh: () => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (start: string, end: string) => void;
  clients: { id: string; name: string }[];
  selectedClients: string[];
  onClientFilterChange: (ids: string[]) => void;
}

export default function TopBar({
  viewLabel,
  isLive,
  onRefresh,
  dateRange,
  onDateRangeChange,
  clients,
  selectedClients,
  onClientFilterChange,
}: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 gap-4"
      style={{
        backdropFilter: 'blur(10px)',
        background: 'rgba(26,26,46,0.8)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}
    >
      {/* Left: View label */}
      <h1 className="text-lg font-semibold text-primary whitespace-nowrap">{viewLabel}</h1>

      {/* Center: Filters */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange(e.target.value, dateRange.end)}
            className="input-field text-sm"
          />
          <span className="text-secondary text-sm">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange(dateRange.start, e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Client filter */}
        <select
          multiple
          value={selectedClients}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
            onClientFilterChange(selected);
          }}
          className="input-field text-sm min-w-[160px] max-h-8"
          title="Filter by client"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Live indicator + refresh */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isLive ? '#00d4ff' : '#ef4444',
              boxShadow: isLive ? '0 0 8px #00d4ff' : 'none',
              animation: isLive ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span className="text-xs text-secondary">{isLive ? 'Live' : 'Offline'}</span>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-white/5 text-secondary hover:text-cyan transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
}
