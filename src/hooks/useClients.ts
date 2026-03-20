import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '../lib/supabase';
import { isValidAppointment, hasValidSetter, clientAchievement, agentAchievement, dailyAverage } from '../lib/calculations';
import { getBusinessDaysBetween } from '../lib/dateUtils';
import type { Appointment, ClientMetrics, AgentMetrics } from '../types';

interface Company {
  company_id: string;
  company_name: string;
}

interface UseClientsOptions {
  dateStart?: string;
  dateEnd?: string;
  selectedClients?: string[];
}

export function useClients(options: UseClientsOptions = {}) {
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: companies } = await supabase.from('companies').select('company_id, company_name');
    if (!companies || companies.length === 0) {
      setLoading(false);
      return;
    }

    const appointments = await fetchAllRows<Appointment>('appointments');

    // Date range for filtering
    const filterStart = options.dateStart || '2000-01-01';
    const filterEnd = options.dateEnd || new Date().toISOString().split('T')[0];
    const businessDays = getBusinessDaysBetween(filterStart, filterEnd);

    const clientMetrics: ClientMetrics[] = (companies as Company[]).map((company) => {
      // Filter appointments to this company AND within date range (by created_at)
      const companyAppts = appointments.filter((a) => {
        if (a.company_id !== company.company_id) return false;
        const createdDate = a.created_at.split('T')[0];
        return createdDate >= filterStart && createdDate <= filterEnd;
      });

      // If "All Clients" mode and no data, skip this company
      // If specific clients are selected, always show them even with zero data
      const isSpecificSelection = options.selectedClients && options.selectedClients.length > 0;
      const isSelected = isSpecificSelection && options.selectedClients!.includes(company.company_id);
      if (companyAppts.length === 0 && !isSelected) return null;

      const validAppts = companyAppts.filter(isValidAppointment);

      // Find all unique setters with valid names in this date range
      const setterNames = new Set<string>();
      companyAppts.forEach((a) => {
        if (hasValidSetter(a)) {
          setterNames.add(a.setter_name!.trim());
        }
      });

      const agentCount = setterNames.size;

      // Build agent metrics
      const agents: AgentMetrics[] = Array.from(setterNames).map((setterName) => {
        const agentAppts = validAppts.filter((a) => a.setter_name?.trim() === setterName);
        const agentAllRecords = companyAppts.filter((a) => a.setter_name?.trim() === setterName);

        return {
          setterName,
          companyId: company.company_id,
          companyName: company.company_name,
          appointmentsBooked: agentAppts.length,
          dailyAvg: dailyAverage(agentAppts.length, businessDays),
          cycleAchievement: agentAchievement(agentAppts.length, businessDays),
          totalLeads: agentAllRecords.length,
        };
      });

      agents.sort((a, b) => b.appointmentsBooked - a.appointmentsBooked);

      return {
        companyId: company.company_id,
        companyName: company.company_name,
        activeAgents: agentCount,
        totalAppointments: validAppts.length,
        cycleAchievement: clientAchievement(validAppts.length, agentCount, businessDays),
        totalLeads: companyAppts.length,
        agents,
      };
    }).filter(Boolean) as ClientMetrics[];

    clientMetrics.sort((a, b) => b.totalLeads - a.totalLeads);

    const filtered = options.selectedClients?.length
      ? clientMetrics.filter((c) => options.selectedClients!.includes(c.companyId))
      : clientMetrics;

    setClients(filtered);
    setLoading(false);
  }, [options.dateStart, options.dateEnd, options.selectedClients]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel('appointments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchData())
      .subscribe((status) => { setIsLive(status === 'SUBSCRIBED'); });
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { clients, loading, isLive, refetch: fetchData };
}
