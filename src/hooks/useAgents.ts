import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '../lib/supabase';
import { isValidAppointment, hasValidSetter, agentCycleAchievement, weeklyAverage } from '../lib/calculations';
import { getElapsedWorkingWeeks } from '../lib/dateUtils';
import type { Appointment, AgentMetrics } from '../types';
import { addDays, format } from 'date-fns';

interface Company {
  company_id: string;
  company_name: string;
}

interface GroupedAgents {
  companyId: string;
  companyName: string;
  agents: AgentMetrics[];
}

interface UseAgentsOptions {
  selectedClients?: string[];
}

export function useAgents(options: UseAgentsOptions = {}) {
  const [grouped, setGrouped] = useState<GroupedAgents[]>([]);
  const [allAgents, setAllAgents] = useState<AgentMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: companies } = await supabase.from('companies').select('company_id, company_name');
    if (!companies) { setLoading(false); return; }

    const appointments = await fetchAllRows<Appointment>('appointments');

    const groups: GroupedAgents[] = [];
    const flatAgents: AgentMetrics[] = [];

    for (const company of companies as Company[]) {
      if (options.selectedClients?.length && !options.selectedClients.includes(company.company_id)) continue;

      const companyAppts = appointments.filter((a) => a.company_id === company.company_id);
      if (companyAppts.length === 0) continue;

      // Determine cycle start from earliest record
      const cycleStartDate = companyAppts.reduce((earliest, a) => {
        return a.created_at < earliest ? a.created_at : earliest;
      }, companyAppts[0].created_at).split('T')[0];

      const cycleStart = new Date(cycleStartDate);
      const cycleEnd = addDays(cycleStart, 30);
      const elapsedWeeks = getElapsedWorkingWeeks(cycleStart);

      const validAppts = companyAppts.filter(isValidAppointment);

      // Find all setters with valid names
      const setterNames = new Set<string>();
      companyAppts.forEach((a) => {
        if (hasValidSetter(a)) {
          setterNames.add(a.setter_name!.trim());
        }
      });

      const agents: AgentMetrics[] = Array.from(setterNames).map((setterName) => {
        const agentValid = validAppts.filter((a) => a.setter_name?.trim() === setterName);
        const agentAll = companyAppts.filter((a) => a.setter_name?.trim() === setterName);

        return {
          setterName,
          companyId: company.company_id,
          companyName: company.company_name,
          cycleStartDate,
          cycleEndDate: format(cycleEnd, 'yyyy-MM-dd'),
          appointmentsBooked: agentValid.length,
          weeklyAvg: weeklyAverage(agentValid.length, elapsedWeeks),
          cycleAchievement: agentCycleAchievement(agentValid.length, elapsedWeeks),
          totalLeads: agentAll.length,
        };
      });

      // Sort agents by appointments descending
      agents.sort((a, b) => b.appointmentsBooked - a.appointmentsBooked);

      if (agents.length > 0) {
        groups.push({ companyId: company.company_id, companyName: company.company_name, agents });
        flatAgents.push(...agents);
      }
    }

    // Sort groups by total agent count descending
    groups.sort((a, b) => b.agents.length - a.agents.length);

    setGrouped(groups);
    setAllAgents(flatAgents);
    setLoading(false);
  }, [options.selectedClients]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { grouped, allAgents, loading, refetch: fetchData };
}
