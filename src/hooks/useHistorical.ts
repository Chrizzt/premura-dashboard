import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '../lib/supabase';
import { isValidAppointment, hasValidSetter } from '../lib/calculations';
import { getWorkingWeeks, getMonthRanges, isInRange } from '../lib/dateUtils';
import type { Appointment, ViewMode } from '../types';

interface Company {
  company_id: string;
  company_name: string;
}

interface HistoricalRow {
  name: string;
  companyId?: string;
  isAgent?: boolean;
  seatCount: number;
  periods: { label: string; count: number; achievement: number }[];
}

interface UseHistoricalOptions {
  viewMode: ViewMode;
  dateStart: string;
  dateEnd: string;
  selectedClients?: string[];
}

export function useHistorical(options: UseHistoricalOptions) {
  const [rows, setRows] = useState<HistoricalRow[]>([]);
  const [agentRows, setAgentRows] = useState<Record<string, HistoricalRow[]>>({});
  const [periodLabels, setPeriodLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: companies } = await supabase.from('companies').select('company_id, company_name');
    const appointments = await fetchAllRows<Appointment>('appointments');
    if (!companies) { setLoading(false); return; }

    const from = new Date(options.dateStart);
    const to = new Date(options.dateEnd);

    const periods = options.viewMode === 'weekly'
      ? getWorkingWeeks(from, to)
      : getMonthRanges(from, to);

    const labels = periods.map((p) => p.label);
    setPeriodLabels(labels);

    const clientRows: HistoricalRow[] = [];
    const agentMap: Record<string, HistoricalRow[]> = {};

    for (const company of companies as Company[]) {
      if (options.selectedClients?.length && !options.selectedClients.includes(company.company_id)) continue;

      const companyAppts = appointments.filter((a) => a.company_id === company.company_id);
      if (companyAppts.length === 0) continue;

      const valid = companyAppts.filter(isValidAppointment);

      // Use created_at for time-based bucketing since most records don't have disposition_date
      const clientPeriods = periods.map((p) => {
        const count = valid.filter((a) => isInRange(a.created_at, p.start, p.end)).length;
        const target = 5; // default 1 seat × 5
        return { label: p.label, count, achievement: target > 0 ? (count / target) * 100 : 0 };
      });

      clientRows.push({
        name: company.company_name,
        companyId: company.company_id,
        seatCount: 1,
        periods: clientPeriods,
      });

      // Agent breakdown
      const setterNames = new Set<string>();
      companyAppts.forEach((a) => {
        if (hasValidSetter(a)) {
          setterNames.add(a.setter_name!.trim());
        }
      });

      agentMap[company.company_id] = Array.from(setterNames).map((setter) => {
        const agentValid = valid.filter((a) => a.setter_name?.trim() === setter);
        const agentPeriods = periods.map((p) => {
          const count = agentValid.filter((a) => isInRange(a.created_at, p.start, p.end)).length;
          return { label: p.label, count, achievement: count > 0 ? (count / 5) * 100 : 0 };
        });

        return {
          name: setter,
          isAgent: true,
          seatCount: 1,
          periods: agentPeriods,
        };
      });
    }

    // Sort by total appointments descending
    clientRows.sort((a, b) => {
      const totalA = a.periods.reduce((s, p) => s + p.count, 0);
      const totalB = b.periods.reduce((s, p) => s + p.count, 0);
      return totalB - totalA;
    });

    setRows(clientRows);
    setAgentRows(agentMap);
    setLoading(false);
  }, [options.viewMode, options.dateStart, options.dateEnd, options.selectedClients]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { rows, agentRows, periodLabels, loading, refetch: fetchData };
}
