import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all rows from a table, handling Supabase's 1000-row page limit.
 */
export async function fetchAllRows<T = any>(table: string, select = '*'): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const allRows: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      break;
    }

    if (data && data.length > 0) {
      allRows.push(...(data as T[]));
      from += PAGE_SIZE;
      hasMore = data.length === PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allRows;
}
