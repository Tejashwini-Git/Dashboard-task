import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StockDataRequest {
  symbols: string[];
}

interface StockData {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  error?: string;
}

async function fetchYahooFinanceData(symbol: string): Promise<{ cmp: number | null }> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return { cmp: data.chart.result[0].meta.regularMarketPrice };
    }
    return { cmp: null };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    return { cmp: null };
  }
}

async function fetchGoogleFinanceData(symbol: string): Promise<{ peRatio: number | null; latestEarnings: string | null }> {
  try {
    const url = `https://www.google.com/finance/quote/${symbol}:NSE`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    
    let peRatio = null;
    let latestEarnings = null;
    
    const peMatch = html.match(/P\/E ratio[\s\S]{0,200}?([\d.]+)/i);
    if (peMatch) {
      peRatio = parseFloat(peMatch[1]);
    }
    
    const earningsMatch = html.match(/Earnings date[\s\S]{0,200}?([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
    if (earningsMatch) {
      latestEarnings = earningsMatch[1];
    }
    
    return { peRatio, latestEarnings };
  } catch (error) {
    console.error(`Error fetching Google Finance data for ${symbol}:`, error);
    return { peRatio: null, latestEarnings: null };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { symbols }: StockDataRequest = await req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Expected 'symbols' array." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const stockDataPromises = symbols.map(async (symbol): Promise<StockData> => {
      try {
        const [yahooData, googleData] = await Promise.all([
          fetchYahooFinanceData(symbol),
          fetchGoogleFinanceData(symbol)
        ]);

        return {
          symbol,
          cmp: yahooData.cmp,
          peRatio: googleData.peRatio,
          latestEarnings: googleData.latestEarnings,
        };
      } catch (error) {
        return {
          symbol,
          cmp: null,
          peRatio: null,
          latestEarnings: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const stockData = await Promise.all(stockDataPromises);

    return new Response(
      JSON.stringify({ data: stockData }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});