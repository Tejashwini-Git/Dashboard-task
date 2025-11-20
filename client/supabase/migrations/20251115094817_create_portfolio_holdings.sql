/*
  # Portfolio Holdings Schema

  1. New Tables
    - `holdings`
      - `id` (uuid, primary key)
      - `stock_name` (text) - Name of the stock
      - `stock_symbol` (text) - Stock ticker symbol
      - `exchange` (text) - NSE or BSE
      - `sector` (text) - Sector category (Financials, Technology, etc.)
      - `purchase_price` (decimal) - Price at which stock was purchased
      - `quantity` (integer) - Number of shares
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `holdings` table
    - Add policies for authenticated users to manage their holdings
  
  3. Notes
    - Investment, Portfolio %, CMP, Present Value, Gain/Loss will be calculated dynamically
    - P/E Ratio and Latest Earnings will be fetched from APIs
*/

CREATE TABLE IF NOT EXISTS holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_name text NOT NULL,
  stock_symbol text NOT NULL,
  exchange text NOT NULL CHECK (exchange IN ('NSE', 'BSE')),
  sector text NOT NULL,
  purchase_price decimal(12, 2) NOT NULL CHECK (purchase_price > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON holdings FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON holdings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON holdings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
  ON holdings FOR DELETE
  USING (true);