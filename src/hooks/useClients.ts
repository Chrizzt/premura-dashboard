import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '../lib/supabase';
import { isValidAppointment, hasValidSetter, clientCycleAchievement, agentCycleAchievement, weeklyAverage } from '../lib/calculations';
import { getElapsedWorkingWeeks } from '../lib/dateUtils';
import type { Appointment, ClientMetrics, AgentMetrics } from '../types';
import { subDays, startOfDay, format, addDays } from 'date-fns';

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

    // Fetch companies from the companies table
    const { data: companies } = await supabase.from('companies').select('company_id, company_name');
    if (!companies || companies.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch ALL appointments (paginated)
    const appointments = await fetchAllRows<Appointment>('appointments');

    // Try to fetch client_seats for seat counts (may be empty)
    const { data: seats } = await supabase.from('client_seats').select('*');
    const seatMap = new Map<string, { seat_count: number; cycle_start_date: string }>();
    if (seats) {
      seats.forEach((s: any) => seatMap.set(s.company_id, { seat_count: s.seat_count, cycle_start_date: s.cycle_start_date }));
    }

    const fourteenDaysAgo = startOfDay(subDays(new Date(), 14)).toISOString();
    const today = new Date();

    const clientMetrics: ClientMetrics[] = (companies as Company[]).map((company) => {
      const companyAppts = appointments.filter((a) => a.company_id === company.company_id);

      if (companyAppts.length === 0) {
        return null; // Skip companies with no appointments
      }

      // Determine cycle start: from client_seats if available, else earliest appointment created_at
      const seatInfo = seatMap.get(company.company_id);
      const cycleStartDate = seatInfo
        ? seatInfo.cycle_start_date
        : companyAppts.reduce((earliest, a) => {
            const d = a.created_at;
            return d < earliest ? d : earliest;
          }, companyAppts[0].created_at).split('T')[0];

      const cycleStart = new Date(cycleStartDate);
      const cycleEnd = addDays(cycleStart, 30);
      const elapsedWeeks = getElapsedWorkingWeeks(cycleStart);

      // Default seat count: from client_seats, or number of active agents, minimum 1
      const seatCount = seatInfo?.seat_count || 1;

      // Valid appointments (not DQ'd) for this company
      const validAppts = companyAppts.filter(isValidAppointment);

      // Appointments with a setter = counted toward that setter
      const setterAppts = validAppts.filter(hasValidSetter);

      // Find active setters: those with any record created in last 14 days
      const activeSetters = new Set<string>();
      companyAppts.forEach((a) => {
        if (hasValidSetter(a) && a.created_at >= fourteenDaysAgo) {
          activeSetters.add(a.setter_name!.trim());
        }
      });

      // Also include setters who have records even if older (so we show all setters with data)
      companyAppts.forEach((a) => {
        if (hasValidSetter(a)) {
          activeSetters.add(a.setter_name!.trim());
        }
      });

      // Build agent metrics
      const agents: AgentMetrics[] = Array.from(activeSetters).map((setterName) => {
        const agentAppts = validAppts.filter((a) => a.setter_name?.trim() === setterName);
        const agentAllRecords = companyAppts.filter((a) => a.setter_name?.trim() === setterName);

        return {
          setterName,
          companyId: company.company_id,
          companyName: company.company_name,
          cycleStartDate,
          cycleEndDate: format(cycleEnd, 'yyyy-MM-dd'),
          appointmentsBooked: agentAppts.length,
          weeklyAvg: weeklyAverage(agentAppts.length, elapsedWeeks),
          cycleAchievement: agentCycleAchievement(agentAppts.length, elapsedWeeks),
          totalLeads: agentAllRecords.length,
        };
      });

      // Sort agents by appointments descending
      agents.sort((a, b) => b.appointmentsBooked - a.appointmentsBooked);

      return {
        companyId: company.company_id,
        companyName: company.company_name,
        cycleStartDate,
        cycleEndDate: format(cycleEnd, 'yyyy-MM-dd'),
        seatCount,
        activeAgents: activeSetters.size,
        totalAppointments: setterAppts.length,
        cycleAchievement: clientCycleAchievement(setterAppts.length, seatCount, elapsedWeeks),
        totalLeads: companyAppts.length,
        agents,
      };
    }).filter(Boolean) as ClientMetrics[];

    // Sort by total leads descending
    clientMetrics.sort((a, b) => b.totalLeads - a.totalLeads);

    // Apply client filter
    const filtered = options.selectedClients?.length
      ? clientMetrics.filter((c) => options.selectedClients!.includes(c.companyId))
      : clientMetrics;

    setClients(filtered);
    setLoading(false);
  }, [options.selectedClients]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('appointments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchData();
      })
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { clients, loading, isLive, refetch: fetchData };
}
