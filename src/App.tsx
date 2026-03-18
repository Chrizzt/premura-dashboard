import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Overview from './components/views/Overview';
import ClientView from './components/views/ClientView';
import AgentView from './components/views/AgentView';
import LeaderboardView from './components/views/Leaderboard';
import HistoricalAnalysis from './components/views/HistoricalAnalysis';
import SettingsView from './components/views/SettingsView';
import { supabase } from './lib/supabase';
import { format, subDays } from 'date-fns';

const viewLabels: Record<string, string> = {
  '/': 'Overview',
  '/clients': 'Client Campaign View',
  '/agents': 'Agent Performance View',
  '/leaderboard': 'Leaderboard',
  '/historical': 'Historical Analysis',
  '/settings': 'Settings',
};

export default function App() {
  const location = useLocation();
  const viewLabel = viewLabels[location.pathname] || 'Dashboard';

  const [isLive, setIsLive] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientList, setClientList] = useState<{ id: string; name: string }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('companies').select('company_id, company_name');
      if (data) {
        setClientList(data.map((d: any) => ({ id: d.company_id, name: d.company_name })));
      }
    }
    fetchClients();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('connection-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {})
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1a1a2e' }}>
      <Sidebar />

      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <TopBar
          viewLabel={viewLabel}
          isLive={isLive}
          onRefresh={handleRefresh}
          dateRange={dateRange}
          onDateRangeChange={(start, end) => setDateRange({ start, end })}
          clients={clientList}
          selectedClients={selectedClients}
          onClientFilterChange={setSelectedClients}
        />

        <main className="flex-1 p-6" key={refreshKey}>
          <Routes>
            <Route path="/" element={<Overview selectedClients={selectedClients} dateStart={dateRange.start} dateEnd={dateRange.end} />} />
            <Route path="/clients" element={<ClientView selectedClients={selectedClients} dateStart={dateRange.start} dateEnd={dateRange.end} />} />
            <Route path="/agents" element={<AgentView selectedClients={selectedClients} dateStart={dateRange.start} dateEnd={dateRange.end} />} />
            <Route path="/leaderboard" element={<LeaderboardView selectedClients={selectedClients} dateStart={dateRange.start} dateEnd={dateRange.end} />} />
            <Route
              path="/historical"
              element={
                <HistoricalAnalysis
                  selectedClients={selectedClients}
                  dateStart={dateRange.start}
                  dateEnd={dateRange.end}
                />
              }
            />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
