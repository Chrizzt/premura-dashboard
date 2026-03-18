import { RefreshCw, ChevronDown, X, Check, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleClient = (id: string) => {
    if (selectedClients.includes(id)) {
      onClientFilterChange(selectedClients.filter((c) => c !== id));
    } else {
      onClientFilterChange([...selectedClients, id]);
    }
  };

  const selectAll = () => onClientFilterChange([]);
  const clearAll = () => onClientFilterChange([]);

  const selectedLabel = selectedClients.length === 0
    ? 'All Clients'
    : selectedClients.length === 1
      ? clients.find((c) => c.id === selectedClients[0])?.name || '1 Client'
      : `${selectedClients.length} Clients`;

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 gap-4"
      style={{
        backdropFilter: 'blur(10px)',
        background: 'rgba(26,26,46,0.85)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        height: '56px',
      }}
    >
      {/* Left: View label */}
      <h1 className="text-lg font-semibold text-primary whitespace-nowrap">{viewLabel}</h1>

      {/* Center: Filters */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Date range - clickable boxes */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:border-cyan/50 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onClick={() => startDateRef.current?.showPicker()}
        >
          <Calendar size={14} className="text-secondary" />
          <span className="text-sm text-primary">{formatDateLabel(dateRange.start)}</span>
          <input
            ref={startDateRef}
            type="date"
            value={dateRange.start}
            max={dateRange.end}
            onChange={(e) => onDateRangeChange(e.target.value, dateRange.end)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
          />
        </div>

        <span className="text-secondary text-sm">to</span>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:border-cyan/50 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onClick={() => endDateRef.current?.showPicker()}
        >
          <Calendar size={14} className="text-secondary" />
          <span className="text-sm text-primary">{formatDateLabel(dateRange.end)}</span>
          <input
            ref={endDateRef}
            type="date"
            value={dateRange.end}
            min={dateRange.start}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange(dateRange.start, e.target.value)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
          />
        </div>

        {/* Client filter dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${clientDropdownOpen ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              minWidth: '180px',
            }}
          >
            <span className="text-sm text-primary flex-1 text-left">{selectedLabel}</span>
            {selectedClients.length > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff' }}
              >
                {selectedClients.length}
              </span>
            )}
            <ChevronDown
              size={14}
              className="text-secondary transition-transform"
              style={{ transform: clientDropdownOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {clientDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: '#16213e',
                border: '1px solid rgba(0,212,255,0.2)',
                width: '320px',
                maxHeight: '400px',
                zIndex: 50,
              }}
            >
              {/* Search */}
              <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-primary outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              {/* Actions bar */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={selectAll}
                  className="text-xs text-cyan hover:underline"
                >
                  All Clients
                </button>
                {selectedClients.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-secondary hover:text-primary flex items-center gap-1"
                  >
                    <X size={10} /> Clear selection
                  </button>
                )}
              </div>

              {/* Client list */}
              <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                {filteredClients.map((client) => {
                  const isSelected = selectedClients.includes(client.id);
                  return (
                    <button
                      key={client.id}
                      onClick={() => toggleClient(client.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      style={{
                        background: isSelected ? 'rgba(0,212,255,0.08)' : 'transparent',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          border: `1.5px solid ${isSelected ? '#00d4ff' : 'rgba(255,255,255,0.2)'}`,
                          background: isSelected ? 'rgba(0,212,255,0.2)' : 'transparent',
                        }}
                      >
                        {isSelected && <Check size={10} style={{ color: '#00d4ff' }} />}
                      </div>
                      <span className="text-sm text-primary truncate">{client.name}</span>
                    </button>
                  );
                })}
                {filteredClients.length === 0 && (
                  <div className="px-3 py-4 text-sm text-secondary text-center">No clients found</div>
                )}
              </div>
            </div>
          )}
        </div>
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
