import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Holding {
  id: string;
  stock_name: string;
  stock_symbol: string;
  exchange: string;
  sector: string;
  purchase_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface StockMarketData {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

export async function fetchHoldings(): Promise<Holding[]> {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .order('sector', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchStockData(symbols: string[]): Promise<StockMarketData[]> {
  const apiUrl = `${supabaseUrl}/functions/v1/fetch-stock-data`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbols }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stock data');
  }

  const result = await response.json();
  return result.data;
}
