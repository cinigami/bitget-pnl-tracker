import { getSupabase } from './supabase';
import { Trade } from '@/types';

// Database row type matching the Supabase table
interface TradeRow {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'long' | 'short' | 'unknown';
  realized_pnl: number;
  fees: number | null;
  roi: number | null;
  result: 'win' | 'loss' | 'breakeven';
  needs_review: boolean;
  confidence_timestamp: 'high' | 'medium' | 'low';
  confidence_symbol: 'high' | 'medium' | 'low';
  confidence_pnl: 'high' | 'medium' | 'low';
  confidence_overall: 'high' | 'medium' | 'low';
  source_image_id: string | null;
  created_at: string;
  updated_at: string;
}

// Convert from app Trade type to database row format
function tradeToRow(trade: Trade): Record<string, unknown> {
  return {
    id: trade.id,
    timestamp: trade.timestamp,
    symbol: trade.symbol,
    side: trade.side,
    realized_pnl: trade.realizedPnl,
    fees: trade.fees,
    roi: trade.roi,
    result: trade.result,
    needs_review: trade.needsReview,
    confidence_timestamp: trade.confidence.timestamp,
    confidence_symbol: trade.confidence.symbol,
    confidence_pnl: trade.confidence.pnl,
    confidence_overall: trade.confidence.overall,
    source_image_id: trade.sourceImageId || null,
    created_at: trade.createdAt,
    updated_at: trade.updatedAt,
  };
}

// Convert from database row to app Trade type
function rowToTrade(row: TradeRow): Trade {
  return {
    id: row.id,
    timestamp: row.timestamp,
    symbol: row.symbol,
    side: row.side,
    realizedPnl: Number(row.realized_pnl),
    fees: row.fees ? Number(row.fees) : null,
    roi: row.roi ? Number(row.roi) : null,
    result: row.result,
    needsReview: row.needs_review,
    confidence: {
      timestamp: row.confidence_timestamp,
      symbol: row.confidence_symbol,
      pnl: row.confidence_pnl,
      overall: row.confidence_overall,
    },
    sourceImageId: row.source_image_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchAllTrades(): Promise<Trade[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }

  return (data as TradeRow[] || []).map(rowToTrade);
}

export async function insertTrade(trade: Trade): Promise<Trade> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('trades')
    .insert(tradeToRow(trade) as never)
    .select()
    .single();

  if (error) {
    console.error('Error inserting trade:', error);
    throw error;
  }

  return rowToTrade(data as TradeRow);
}

export async function insertTrades(trades: Trade[]): Promise<Trade[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('trades')
    .insert(trades.map(tradeToRow) as never[])
    .select();

  if (error) {
    console.error('Error inserting trades:', error);
    throw error;
  }

  return (data as TradeRow[] || []).map(rowToTrade);
}

export async function updateTrade(trade: Trade): Promise<Trade> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const updateData = {
    timestamp: trade.timestamp,
    symbol: trade.symbol,
    side: trade.side,
    realized_pnl: trade.realizedPnl,
    fees: trade.fees,
    roi: trade.roi,
    result: trade.result,
    needs_review: trade.needsReview,
    confidence_timestamp: trade.confidence.timestamp,
    confidence_symbol: trade.confidence.symbol,
    confidence_pnl: trade.confidence.pnl,
    confidence_overall: trade.confidence.overall,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trades')
    .update(updateData as never)
    .eq('id', trade.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating trade:', error);
    throw error;
  }

  return rowToTrade(data as TradeRow);
}

export async function deleteTrade(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting trade:', error);
    throw error;
  }
}

export async function deleteAllTrades(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('trades')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (error) {
    console.error('Error deleting all trades:', error);
    throw error;
  }
}

export async function checkDuplicate(
  timestamp: string,
  symbol: string,
  pnl: number
): Promise<Trade | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Check for trades within 1 minute of the timestamp with same symbol and PnL
  const startTime = new Date(new Date(timestamp).getTime() - 60000).toISOString();
  const endTime = new Date(new Date(timestamp).getTime() + 60000).toISOString();

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('symbol', symbol)
    .gte('timestamp', startTime)
    .lte('timestamp', endTime)
    .gte('realized_pnl', pnl - 0.01)
    .lte('realized_pnl', pnl + 0.01)
    .limit(1);

  if (error) {
    console.error('Error checking duplicate:', error);
    return null;
  }

  const rows = data as TradeRow[] | null;
  return rows && rows.length > 0 ? rowToTrade(rows[0]) : null;
}
