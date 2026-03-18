import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '../lib/supabase';
import { isValidAppointment, hasValidSetter, agentAchievement, dailyAverage } from '../lib/calculations';
import { getBusinessDaysBetween } from '../lib/dateUtils';
import type { Appointment, AgentMetrics } from '../types';

interface Company {
  company_id: string;
  company_name: string;
}

interface UseAgentsOptions {
  dateStart?: string;
  dateEnd?: string;
  selectedClients?: string[];
}

export function useAgents(options: UseAgentsOptions = {}) {
  const [allAgents, setAllAgents] = useState<AgentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: companies } = await supabase.from('companies').select('company_id, company_name');
    if (!companies) { setLoading(false); return; }

    const appointments = await fetchAllRows<Appointment>('appointments');

    const filterStart = options.dateStart || '2000-01-01';
    const filterEnd = options.dateEnd || new Date().toISOString().split('T')[0];
    const businessDays = getBusinessDaysBetween(filterStart, filterEnd);

    const companyMap = new Map<string, string>();
    (companies as Company[]).forEach((c) => companyMap.set(c.company_id, c.company_name));

    // Filter appointments by date range
    const rangeAppts = appointments.filter((a) => {
      const createdDate = a.created_at.split('T')[0];
      return createdDate >= filterStart && createdDate <= filterEnd;
    });

    // Optionally filter by selected clients
    const filteredAppts = options.selectedClients?.length
      ? rangeAppts.filter((a) => options.selectedClients!.includes(a.company_id))
      : rangeAppts;

    // Build a flat list of agents across all companies
    const agentMap = new Map<string, { companyId: string; companyName: string; validAppts: number; totalLeads: number }>();

    filteredAppts.forEach((a) => {
      if (!hasValidSetter(a)) return;
      const setterName = a.setter_name!.trim();
      const key = `${setterName}___${a.company_id}`;
      const existing = agentMap.get(key);
      const isValid = isValidAppointment(a);

      if (existing) {
        if (isValid) existing.validAppts++;
        existing.totalLeads++;
      } else {
        agentMap.set(key, {
          companyId: a.company_id,
          companyName: companyMap.get(a.company_id) || a.company_id,
          validAppts: isValid ? 1 : 0,
          totalLeads: 1,
        });
      }
    });

    const flatAgents: AgentMetrics[] = [];
    agentMap.forEach((data, key) => {
      const setterName = key.split('___')[0];
      flatAgents.push({
        setterName,
        companyId: data.companyId,
        companyName: data.companyName,
        appointmentsBooked: data.validAppts,
        dailyAvg: dailyAverage(data.validAppts, businessDays),
        cycleAchievement: agentAchievement(data.validAppts, businessDays),
        totalLeads: data.totalLeads,
      });
    });

    flatAgents.sort((a, b) => b.appointmentsBooked - a.appointmentsBooked);

    setAllAgents(flatAgents);
    setLoading(false);
  }, [options.dateStart, options.dateEnd, options.selectedClients]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { allAgents, loading, refetch: fetchData };
}
