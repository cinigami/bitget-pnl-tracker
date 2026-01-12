-- Create trades table for Bitget PnL Tracker
-- Run this in Supabase SQL Editor

-- Create enum types
CREATE TYPE trade_side AS ENUM ('long', 'short', 'unknown');
CREATE TYPE trade_result AS ENUM ('win', 'loss', 'breakeven');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  side trade_side DEFAULT 'unknown',
  realized_pnl DECIMAL(20, 8) NOT NULL,
  fees DECIMAL(20, 8),
  roi DECIMAL(10, 4),
  result trade_result NOT NULL,
  needs_review BOOLEAN DEFAULT false,
  confidence_timestamp confidence_level DEFAULT 'medium',
  confidence_symbol confidence_level DEFAULT 'medium',
  confidence_pnl confidence_level DEFAULT 'medium',
  confidence_overall confidence_level DEFAULT 'medium',
  source_image_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_result ON trades(result);
CREATE INDEX idx_trades_needs_review ON trades(needs_review) WHERE needs_review = true;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (no auth)
-- You can modify this later to add user-based access control
CREATE POLICY "Allow all operations on trades" ON trades
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access to anon and authenticated users
GRANT ALL ON trades TO anon;
GRANT ALL ON trades TO authenticated;
